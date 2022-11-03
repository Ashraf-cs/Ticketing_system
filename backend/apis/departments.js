const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");

const router = express.Router();
const pool = mysql.createPool(JSON.parse(process.env.database))

router.use(express.urlencoded({extended: true}));

/* Retrieving departments list from database and send it to 
    client (privileged technicians only) with renewed token (new exp time) */
router.post("/get", (req, res) => {
    jwt.verify(req.body.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result.catg == "technicians"){
            if(result.privilege == "super" || result.privilege == "admin"){
                pool.query("SELECT * FROM departments", (err, depts) => {
                    if(err) console.log(err)
                    
                    res.json({auth: true, newToken: req.body.newToken, status: true, depts: depts})
                })
            }else{
                res.end()
            }
        }else{
            res.end()
        }
    })
})


// Adding a new department to database (privileged technicians only)
router.post("/", (req, res) => {
    jwt.verify(req.body.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result.catg == "technicians"){
            if(result.privilege == "super"){
                pool.query(`INSERT INTO departments VALUES("${req.body.name}", "active");`, (err, result) => {
                    if(err) {console.log(err);
                        
                    res.json({status: false}) }

                    if(result){
                        res.json({status: true})
                    }
                })
            }
        }
    })
})


/* Deleting a department by taged it with deleted status-not actual deleting (privileged technicians only) 
    and record the action in department_updates table */
router.post("/delete", (req, res) => {
    jwt.verify(req.body.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result.catg == "technicians"){
            if(result.privilege == "super"){
                pool.query(`UPDATE departments SET status = "deleted" WHERE name = "${req.body.name}";`)

                pool.query(`INSERT INTO departments_updates VALUES (NULL, "${req.body.name}", 
                    "status", "deleted", "${result.username}", NOW())`, (err, result) => {
                        if(err) console.log(err)
                })
                res.status(200).end()
            }else{
                res.end()
            }
        }else{
            res.end()
        }
    })    
})


module.exports = router
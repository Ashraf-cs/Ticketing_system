const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");

const router = express.Router();
router.use(express.urlencoded({extended: true}));

const pool = mysql.createPool(JSON.parse(process.env.database))


// Retrieve companies list from database and send it to client
router.get("/get", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result && result.catg == "technicians"){
            if(result.role == "super" || result.role == "admin"){
                pool.query("SELECT * FROM companies", (err, companies) => {
                    if(err) console.log(err)
                    
                    res.json({status: true, companies: companies})

                })
            }else{
                res.end()
            }
        }else{
            res.end()
        }
    })
})


// Add a new company to database
router.post("/", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result && result.catg == "technicians"){
            if(result.role == "super"){
                pool.query(`INSERT INTO companies VALUES("${req.body.name}", "active");`, (err, result) => {
                    if(err) {console.log(err);res.json({status: false}) }

                    if(result){
                        pool.query(`SELECT * FROM companies WHERE name = "${req.body.name}"`, (err, company) => {
                            if(err) console.log(err)
                            
                            res.json({status: true})
                            
                        })
                    }
                })
            }
        }
    })
})


// Delete a company from database
router.delete("/", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result && result.catg == "technicians"){
            if(result.role == "super"){
                pool.query(`UPDATE companies SET status = "deleted" WHERE name = "${req.body.name}";`)

                pool.query(`INSERT INTO companies_updates VALUES (NULL, "${req.body.name}", 
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
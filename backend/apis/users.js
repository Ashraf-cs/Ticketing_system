const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const randombytes = require("randombytes");

const router = express.Router();
router.use(express.urlencoded({extended: true}))

const pool = mysql.createPool(JSON.parse(process.env.database))


/* Retrieving users list eaither technicians or employees from database and send 
    it to client (privileged technicians only) with renewed token (new exp time) */
router.post("/get", (req, res) => {
    jwt.verify(req.body.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result.catg == "technicians"){
            if(result.privilege == "super" || result.privilege == "admin"){
                pool.query(`SELECT *, IF(LENGTH(password) != 60, password, "none") AS password,
                    DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") AS created_at FROM users 
                    WHERE category = "${req.body.category}" AND privilege != "super" AND status != "deleted"`, (err, users) => {
                    if(err) console.log(err)
                    
                    res.json({status: true, newToken: req.body.newToken, users: users})
                })
            }else{
                res.end()
            }
        }else{
            res.end()
        }
    })
})


/* Retrieve an user updates history eaither technician or employee from database 
    and send it to client (privileged technicians only) */
router.post("/history", (req, res) => {
    jwt.verify(req.body.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result.catg == "technicians"){
            if (result.privilege == "super" || result.privilege == "admin"){
                pool.query(`SELECT *, DATE_FORMAT(updated_at, "%Y-%m-%d %H:%i:%s") AS updated_at 
                    FROM users_updates WHERE user = "${req.body.username}"`, (err, history) => {
                    if(err) console.log(err)

                    res.send({auth: true, history: history})
                })

            }else{
                res.end()
            }
        }else{
            res.end()
        }
    })
})


// Adding a new user to database with a temporary password (privileged technicians only)
router.post("/", (req, res) => {
    jwt.verify(req.body.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result.catg == "technicians"){
            if(result.privilege == "super"){
                pool.query(`INSERT INTO USERS VALUES("${req.body.username}", "${req.body.name}", 
                    "${randombytes(4).toString("hex")}", "${(req.body.dept).toString().trim()}", "${req.body.category}", 
                    "${req.body.privilege}", "active", NOW());`, (err, result) => {
                    if(err){
                        console.log(err)
                        res.json({status: false})
                    }

                    res.json({status: true})
                })
            }
        }
    })
})


/* Updating an user information on database except username (privileged technicians only)
    and record the action in users_updates table */
router.put("/", (req, res) => {
    jwt.verify(req.body.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result.catg == "technicians"){
            if(result.privilege == "super"){
                for(let field in req.body){
                    if(req.body[field] != '' && field != "username" && field != "token"){
                        pool.query(`UPDATE users SET ${field} = "${(req.body[field]).toString()}" 
                            WHERE username = "${req.body.username}";`, (err, result) => {
                            if(err) console.log(err)
                        })

                        pool.query(`INSERT INTO users_updates VALUES (NULL, "${req.body.username}", "${req.body.category}",
                            "${field}", "${req.body[field]}", "${result.username}", NOW())`, (err, result) => {
                            if(err) console.log(err)
                        })
                    }
                }
                res.status(200).end()
            }else{
                res.end()
            }
        }else{
            res.end()
        }
    })
})


/* Deleting an user by tagging with deleted status-not actual deleting (privileged technicians only)
    and record the action in users_updates table */
router.post("/delete", (req, res) => {
    jwt.verify(req.body.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result.catg == "technicians"){
            if(result.privilege == "super"){
                pool.query(`UPDATE users SET status = "deleted" WHERE username = "${req.body.username}";`)

                pool.query(`INSERT INTO users_updates VALUES (null, "${req.body.username}", "${req.body.category}",
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


module.exports = router;

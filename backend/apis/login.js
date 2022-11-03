const express = require("express")
const mysql = require("mysql")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const router = express.Router()
const pool = mysql.createPool(JSON.parse(process.env.database))

// Authentication and authorization of all users
router.post('/', (req, res) => {
    pool.query(`SELECT password, category, privilege FROM users WHERE username = '${req.body.username}'`, (err, data) => {
        if(err) console.log(err)

        if(data != ''){
            // If this condition is true it means that first time login for the user and will be asked to assign a new one
            if(req.body.password == data[0].password){
                res.json({status: "none", username: req.body.username, catg: data[0].category})
            }else{
                bcrypt.compare(req.body.password, data[0].password, (err, result) => {
                    if(err) console.log(err)

                    if(result){
                        jwt.sign({username: req.body.username, catg: data[0].category, privilege: data[0].privilege, 
                            exp: Math.floor(Date.now() / 1000) + (15 * 60)}, process.env.secret, (err, token) => {
                                if(err) console.log(err)

                                res.json({status: true, token: token, username: req.body.username, 
                                    catg: data[0].category, privilege: data[0].privilege})
                            })
                    }else{
                        res.json({status: false})
                    }
                })
            }
        }else{
            res.json({status: false})
        }
    })
})


// Logging out an user by sending expired token
router.post("/logout", (req, res) => {

    jwt.sign({exp: Math.floor(Date.now() / 1000) - 30}, process.env.secret, (err, token) => {
        res.json({token: token})
    })
})


// Updating password of an user after first time login
router.post("/first", (req, res) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err) console.log(err)

        pool.query(`UPDATE users SET password = "${hash}" WHERE username = "${req.body.username}"`)
    })
})


module.exports = router
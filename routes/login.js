const express = require("express")
const mysql = require("mysql")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const router = express.Router()

const pool = mysql.createPool(JSON.parse(process.env.database))

// Render technicians login page or redirect to relevant page
router.get("/technicians", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result && result.catg == "technician"){
            res.redirect("/technicians/home")
        }else if(result && result.catg != "technician"){
            res.redirect(`/${result.catg}/home`)
        }else{
            res.render("login_technicians")
        }
    })
})


// Authentication and authorization of technicians
router.post("/technicians", (req, res) => {
    pool.query(`SELECT password, role FROM technicians WHERE username = "${req.body.username}" and status = "active"`, (err, data) => {
        if(err) console.log(err)
        if(data != ""){

            if(req.body.password == data[0].password){
                
                res.render("first_login", {catg: "technicians", username: req.body.username})
            }else{
                bcrypt.compare(req.body.password, data[0].password, (err, result) => {
                    if(err) console.log(err)
                    
                    if(result){
                        jwt.sign({username: req.body.username, catg: "technicians", role: data[0].role, exp: Math.floor(Date.now() / 1000) + (60 * 15)}, 
                            process.env.secret, (err, token) => {
                            if(err) console.log(err)
                            res.cookie("token", token).redirect("/technicians/home")
                        })
                        
                    }
                    else{
                        res.render("login_technicians", {message: "Invalid username or password"})
                    }
                })
            }
            
        }
        else{
            res.render("login_technicians", {message: "Invalid username or password"})
        }
        
    })
})


// Render technicians login page or redirect to relevant page
router.get("/employees", (req, res) => {
    if(req.cookies.token){
        jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
            if(err) console.log(err)
            
            if(result && result.catg == "employees"){
                res.redirect("/employees/home")
            }else if(result && result.catg != "employees"){
                res.redirect(`/${result.catg}/home`)
            }else{
                res.render("login_employees")
            }
        })
    }else{
        res.render("login_employees")
    }
})


// Authentication and authorization of technicians
router.post("/employees", (req, res) => {
    console.log(req.headers.referer)
    pool.query(`SELECT password FROM employees WHERE username = "${req.body.username}" and status = "active"`, (err, data) => {
        if(err) console.log(err)
        if(data != ""){
    
            if(req.body.password == data[0].password){
                res.render("first_login", {catg: "employees", username: req.body.username})
            }else{
                bcrypt.compare(req.body.password, data[0].password, (err, result) => {
                    if(err) console.log(err)
    
                    if(result){
                        jwt.sign({username: req.body.username, catg: "employees", exp: Math.floor(Date.now() / 1000) + (60 * 15)}, 
                            process.env.secret, (err, token) => {
                            if(err) console.log(err)
    
                            res.cookie("token", token).redirect("/employees/home")
                        })
                    }
                    else{
                        res.render("login_employees", {message: "Username or password is invalid"})
                    }
                })
            }
        }
        else{
            res.render("login_employees", {message: "Username or password is invalid"})
        }
        
    })
})


// Log out signed in a technician or an employee
router.post("/logout", (req, res) => {

    jwt.sign({exp: Math.floor(Date.now() / 1000) - 30}, process.env.secret, (err, token) => {

        res.cookie("token", token).redirect(`${req.headers.referer}`)
    })

})


// Update passwords of a technician or an employee after first login
router.post("/first", (req, res) => {
    console.log(req.body)
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err) console.log(err)

        pool.query(`UPDATE ${req.body.catg} SET password = "${hash}" WHERE username = "${req.body.username}"`)
        res.redirect(`/login/${req.body.catg}`)
    })
})


module.exports = router
const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const randombytes = require("randombytes");

const router = express.Router();
router.use(express.urlencoded({extended: true}))

const pool = mysql.createPool(JSON.parse(process.env.database))


// Redirect requests to root path of this route to /home path
router.get("/", (req, res, next) => {
    res.redirect(`${req.baseUrl}/home`)
})


// Render a home page of a technician 
router.get("/home", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(result && result.catg == "technicians"){
            jwt.sign({username: result.username, catg:"technicians", role: result.role,
                exp: Math.floor(Date.now() / 1000) + (60 * 15)}, process.env.secret, (err, token) => {

                if(result.role == "user"){
                    res.cookie("token", token).render("technicians", {name: result.username})
                    
                }else if(result.role == "super" || result.role == "admin"){
                    pool.query("SELECT name FROM companies WHERE status = 'active'", (err, companies) => {
                        if(err) console.log(err)

                        res.cookie("token", token).render("admin", {admin:true, name: result.username, companies: companies})
                    })
                }
            })

        }else if(result && result.catg != "technicians"){
            res.redirect(`/${result.catg}/home`)
        }else{
            res.redirect("/login/technicians")
        }
    })
})


// Render tickets list page
router.get("/tickets_list", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(result && result.catg == "technicians"){
            jwt.sign({username: result.username, catg:"technicians", role: result.role, 
                exp: Math.floor(Date.now() / 1000) + (60 * 15)}, process.env.secret, (err, token) => {

                if(result.role == "user"){
                    res.cookie("token", token).render("technicians", {name: result.username})
                    
                }else if(result.role == "super" || result.role == "admin"){
                    pool.query("SELECT name FROM companies WHERE status = 'active'", (err, companies) => {
                        res.cookie("token", token).render("tickets_list", {admin:true, name: result.username, companies: companies})
                    })
                }  
            })

        }else if(result && result.catg != "technicians"){
            res.redirect(`/${result.catg}/home`)
        }else{
            res.redirect("/login/technicians")
        }
    })
})


// Render technicians list page
router.get("/technicians_list", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(result && result.catg == "technicians"){
            jwt.sign({username: result.username, catg:"technicians", role: result.role, 
                exp: Math.floor(Date.now() / 1000) + (60 * 15)}, process.env.secret, (err, token) => {

                if(result.role == "super" || result.role == "admin"){
                    pool.query("SELECT name FROM companies WHERE status = 'active'", (err, companies) => {
                        if(err) console.log(err)
                        
                        res.cookie("token", token).render("technicians_list", {admin:true, name: result.username, companies: companies})
                    })
                    
                }else{
                    res.end()
                }
            })
            
        }else{
            res.redirect("/login/technicians")
        }
    })
})


// Render employees list page
router.get("/employees_list", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(result && result.catg == "technicians"){
            jwt.sign({username: result.username, catg:"technicians", role: result.role, 
                exp: Math.floor(Date.now() / 1000) + (60 * 15)}, process.env.secret, (err, token) => {

                if(result.role == "super" || result.role == "admin"){
                    pool.query("SELECT name FROM companies WHERE status = 'active'", (err, companies) => {
                        if(err) console.log(err)
                        
                        res.cookie("token", token).render("employees_list", {admin:true, name: result.username, companies: companies})
                    })
                
                }else{
                    res.end()
                }
            })
            
        }else{
            res.redirect("/login/technicians")
        }
    })
})


// Render companies list page
router.get("/companies_list", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(result && result.catg == "technicians"){
            jwt.sign({username: result.username, catg:"technicians", role: result.role, 
                exp: Math.floor(Date.now() / 1000) + (60 * 15)}, process.env.secret, (err, token) => {

                if(result.role == "super" || result.role == "admin"){
                    res.cookie("token", token).render("companies_list", {admin:true, name: result.username})
                }else{
                    res.end()
                }
            })
            
        }else{
            res.redirect("/login/technicians")
        }
    })
})


// Retrieve technician list from database and send it to client
router.get("/get", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result && result.catg == "technicians"){
            if(result.role == "super" || result.role == "admin"){
                pool.query(`SELECT *, IF(LENGTH(password) != 60, password, "none") as password,
                    date_format(created_at, "%Y-%m-%d %H-%i-%s") as created_at FROM technicians 
                    WHERE role != "super" and status != "deleted"`, (err, technicians) => {
                    if(err) console.log(err)
    
                    pool.query("SELECT name FROM companies WHERE status = 'active'", (err, companies) => {
                        if(err) console.log(err)

                        res.json({status: true, technicians: technicians ,companies: companies})
                    })
                })
            }else{
                res.end()
            }
        }else{
            res.end()
        }
    })
})


// Retrieve a technician updates history from database and send it to client
router.get("/history", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result && result.catg == "technicians"){
            if (result.role == "super" || result.role == "admin"){
                pool.query(`SELECT *, date_format(updated_at, "%Y-%m-%d %H:%i:%s") as updated_at 
                    FROM technicians_updates WHERE technician = "${req.query.username}"`, (err, history) => {
                    if(err) console.log(err)

                    res.send(history)
                })

            }else{
                res.end()
            }
        }else{
            res.end()
        }
    })
})


// Add a new technician to database
router.post("/", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result && result.catg == "technicians"){
            if(result.role == "super"){
                
                pool.query(`INSERT INTO technicians VALUES("${req.body.username}", "${req.body.name}", 
                    "${randombytes(4).toString("hex")}", "${(req.body.company).toString().trim()}", "${req.body.role}", "active", NOW());`, (err, result) => {
                    if(err) {console.log(err);res.json({status: false}) }

                    if(result){
                        pool.query(`SELECT * FROM technicians WHERE username = "${req.body.username}"`, (err, technician) => {
                            if(err) console.log(err)
                                
                            pool.query(`SELECT name FROM companies WHERE status = 'active'`, (err, companies) => {
                                if(err) console.log(err)
                                technician[0]["companies"] = companies
                
                                res.json({status: true})
                            })
                        })
                    }
                })
            }
        }
    })
})


// Update an technician information on database
router.put("/", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result && result.catg == "technicians"){
            if(result.role == "super"){
                
                for(let field in req.body){
                    if(req.body[field] && field != "username"){
                        pool.query(`update technicians SET ${field} = "${(req.body[field]).toString()}" 
                            WHERE username = "${req.body.username}";`, (err, result) => {
                            if(err) console.log(err)
                            
                        })

                        pool.query(`INSERT INTO technicians_updates VALUES (NULL, "${req.body.username}", 
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


// Delete an technician from database
router.delete("/", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result && result.catg == "technicians"){
            if(result.role == "super"){
                pool.query(`UPDATE technicians SET status = "deleted" WHERE username = "${req.body.username}";`)

                pool.query(`INSERT INTO technicians_updates VALUES (null, "${req.body.username}", 
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

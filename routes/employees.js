const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const randombytes = require("randombytes");

const router = express.Router();
router.use(express.urlencoded({extended: true}));

const pool = mysql.createPool(JSON.parse(process.env.database))


// Redirect requests to root path of this route to /home path
router.get("/", (req, res, next) => {
    res.redirect(`${req.baseUrl}/home`)
})


// Render a home page of an employee 
router.get("/home", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result && result.catg == "employees"){
            jwt.sign({username: result.username, catg:"employees", role: result.role, 
                exp: Math.floor(Date.now() / 1000) + (60 * 15)}, process.env.secret, (err, token) => {

                pool.query(`SELECT company FROM employees WHERE username = "${result.username}"`, (err, data) => {
                    if(err) console.log(err)

                    res.cookie("token", token).render("employees", {name: result.username, catg: result.catg, company: data[0].company})
                })
            })
            
        }else if(result && result.catg != "employees"){
            res.redirect(`/${result.catg}/home`)
        }
        else{
            res.redirect("/login/employees")
        }
    })
})


// Retrieve employees list from database and send it to client
router.get("/get", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(err) console.log(err)
        
        if(result && result.catg == "technicians"){
            if(result.role == "super" || result.role == "admin"){
                pool.query(`SELECT *, IF(LENGTH(password) != 60, password, "none") as password,
                    date_format(created_at, "%Y-%m-%d %H-%i-%s") as created_at FROM employees 
                    WHERE status != "deleted"`, (err, employees) => {
                    if(err) console.log(err)
    
                    pool.query("SELECT name FROM companies", (err, companies) => {
                        if(err) console.log(err)
    
                        res.json({status: true, employees: employees ,companies: companies})
                    })
                })
            }else{
                res.json({})
            }
        }else{
            res.json({})
        }
    })
})


// Retrieve an employee updates history from database and send it to client
router.get("/history", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result && result.catg == "technicians"){
            if (result.role == "super" || result.role == "admin"){
                pool.query(`SELECT *, date_format(updated_at, "%Y-%m-%d %H:%i:%s") as updated_at 
                    FROM employees_updates WHERE employee = "${req.query.username}"`, (err, history) => {
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


// Add a new employee to database
router.post("/", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(err) console.log(err)
        
        if(result && result.catg == "technicians"){
            if(result.role == "super"){
                try{
                    pool.query(`INSERT INTO employees VALUES("${req.body.username}", "${req.body.name}", 
                        "${randombytes(4).toString("hex")}", "${(req.body.company).toString().trim()}", "active", NOW());`, (err, result) => {
                            if(err) {console.log(err);res.json({status: false}) }
                
                        if(result){
                            pool.query(`SELECT * FROM employees WHERE username = "${req.body.username}"`, (err, employee) => {
                                if(err) console.log(err)

                                pool.query(`SELECT name FROM companies`, (err, companies) => {
                                    if(err) console.log(err)
                                    employee[0]["companies"] = companies
                    
                                    res.json({status: true})
                                })
                                
                            })
                        }
                    })
                }catch{
                    res.json({status: false})
                }
            }
        }
    })
})


// Update an employee information on database
router.put("/", (req, res) => {
    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result && result.catg == "technicians"){
            if(result.role == "super"){
                for(let field in req.body){
                    if(req.body[field] && field != "username"){
                        pool.query(`update employees set ${field} = "${(req.body[field]).toString()}" 
                            WHERE username = "${req.body.username}";`, (err, result) => {
                            if(err) console.log(err)
                            
                        })

                        pool.query(`INSERT INTO employees_changes VALUES (null, "${req.body.username}", 
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


// Delete an employee from database
router.delete("/", (req, res) => {

    jwt.verify(req.cookies.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result && result.catg == "technicians"){
            if(result.role == "super"){
                pool.query(`UPDATE employees SET status = "deleted" WHERE username = "${req.body.username}";`)

                pool.query(`INSERT INTO employees_changes VALUES (null, "${req.body.username}", 
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

const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");

const router = express.Router();
router.use(express.urlencoded({extended: true}))

const pool = mysql.createPool(JSON.parse(process.env.database))

/* Adding a ticket to database and assigning it to the responsible technician based on 
    the ticket creator department, and if there is no technician responsible for the ticket 
    creator department, ticket will be assgined to the super admin of the system */
router.post("/", (req, res) => {
    let technicians = []
    let technician;
    let lowest = -1;

    pool.query(`SELECT username FROM users WHERE category = "technicians" AND department LIKE "%${req.body.dept}%" 
        AND status = "active"`, (err, data) => {
        if(err) console.log(err)

        if(data != ""){
            data.forEach(technician => {
                technicians.push(technician.username)
            });

            pool.query(`SELECT technician FROM tickets`, (err, data) => {
                if(err) console.log(err)

                data = JSON.stringify(data);
                
                technicians.forEach((tech) => {
                    if(data.indexOf(tech) != -1){
                        let name = new RegExp(tech, "g");
                        let count = data.match(name).length;
        
                        if(lowest == -1){
                            technician = tech;
                            lowest = count;
                        }
                        else if(count < lowest){
                            technician = tech;
                            lowest = count;
                        }
                    }
                    else{
                        technician = tech;
                        lowest = 0;
                    }
                })
        
                pool.query(`INSERT INTO tickets VALUES (NULL, NOW(), "${technician}", "${req.body.username}", "${req.body.phone}",
                    "${req.body.dept}", "${req.body.category}", "${req.body.description}", "open", "", "00-00-00", NULL)`, 
                    (err, result) => {
                    if(err) console.log(err)
                    
                    res.status(200).end()
                })
            })
        }else if(data == ""){
            pool.query(`SELECT username from technicians WHERE privilege = "super" and status = "active"`, (err, admins) => {
                if(err) console.log(err)

                pool.query(`INSERT INTO tickets VALUES (NULL, NOW(), "${admins[0].username}", "${req.body.username}", "${req.body.phone}",
                    "${req.body.dept}", "${req.body.category}", "${req.body.description}", "open", "", "00-00-00", NULL)`, 
                    (err, result) => {
                    if(err) console.log(err)

                    res.status(200).end()
                
                })
            })
        }
    })
})


// Retrieving tickets list of a technician or an employee
// Retrieving all tickets of current year and month and send it to client (privileged technicians only)
// Sending renewed token (new exp time) in the response
router.post("/get", (req, res) => {
    let date = new Date()

    jwt.verify(req.body.token, process.env.secret, (err, result) => {
        if(result.catg == "technicians"){
            if(result.privilege == "super"){
                pool.query(`SELECT *, date_format(created_at, "%Y-%m-%d %H:%i:%s") AS created_at,
                    date_format(closed_at, "%Y-%m-%d %H:%i:%s") AS closed_at 
                    FROM tickets WHERE year(created_at) = ${date.getFullYear()} 
                    and month(created_at) = ${date.getMonth()+1}`, (err, tickets) => {
                    if(err) console.log(err)

                    res.json({auth: true, newToken: req.body.newToken, tickets: tickets})

                })  
            }else if (result.privilege == "user"){
                pool.query(`SELECT *, date_format(created_at, "%Y-%m-%d %H:%i:%s") AS created_at,
                    date_format(closed_at, "%Y-%m-%d %H:%i:%s") AS closed_at FROM tickets 
                    WHERE technician = "${result.username}"`, (err, tickets) => {
                    if(err) console.log(err)
    
                    res.json({auth: true, newToken: req.body.newToken, tickets: tickets})
                })
            }
        }else if(result.catg == "employees"){
            pool.query(`SELECT id, date_format(created_at, "%Y-%m-%d %H:%i:%s") AS created_at,
                date_format(closed_at, "%Y-%m-%d %H:%i:%s") AS closed_at, department, phone,
                category, description, status FROM tickets 
                WHERE employee = "${result.username}"`, (err, tickets) => {
                if(err) console.log(err)

                pool.query(`SELECT department FROM employees WHERE username = "${result.username}"`, (err, dept) => {
                    if(err) console.log(err)

                    res.json({auth: true, newToken: req.body.newToken, tickets: tickets,username: result.username, dept: dept[0].department})
                })
            })
        }else{
            res.end()
        }
    })
})


/* Retrieving all tickets of specific year and send it to client (privileged technicians only)
    with renewed token (new exp time) */
router.post("/get_all", (req, res) => {
    let date = new Date()

    jwt.verify(req.body.token, process.env.secret, (err, result) => {
        if(result.catg == "technicians"){
            if(result.privilege == "super"){
                let year = (req.body.year) ? req.body.year : date.getFullYear()
                
                pool.query(`SELECT *, date_format(created_at, "%Y-%m-%d %H:%i:%s") AS created_at,
                    date_format(closed_at, "%Y-%m-%d %H:%i:%s") AS closed_at 
                    FROM tickets WHERE year(created_at) = "${year}"`, (err, tickets) => {
                    if(err) console.log(err)
                    
                    pool.query("SELECT DISTINCT year(created_at) AS year from tickets", (err, years) => {
                        if(err) console.log(err)
                        
                        res.json({auth: true, newToken: req.body.newToken, years: years, tickets: tickets})

                    })
                })  
            }
        }else if(result.catg != "technicians"){
            res.end()
        }else{
            res.end()
        }
    })
})


// Retrieve a ticket updates history from database and send it to client (privileged technicians only)
router.post("/history", (req, res) => {
    jwt.verify(req.body.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result.catg == "technicians"){
            if (result.privilege == "super" || result.privilege == "admin"){
                pool.query(`SELECT *, date_format(updated_at, "%Y-%m-%d %H:%i:%s") AS updated_at 
                    FROM tickets_updates WHERE ticket_id = "${req.body.id}"`, (err, history) => {
                    if(err) console.log(err)

                    res.json({auth: true, history: history})
                })

            }else{
                res.end()
            }
        }else{
            res.end()
        }
    })
})


// Updating a ticket's technician in database (privileged technicians only)
router.put("/", (req, res) => {
    jwt.verify(req.body.token, process.env.secret, (err, result) => {
        if(err) console.log(err)
        
        if(result.catg == "technicians"){
            if(result.privilege == "super"){
                pool.query(`UPDATE tickets SET technician = "${req.body.technician}"
                    WHERE id = ${req.body.ticket}`, (err, result) => {
                        if(err) console.log(err);
                })

                pool.query(`INSERT INTO tickets_updates VALUES (NULL, "${req.body.ticket}", 
                    "technician", "${req.body.technician}", "${result.username}", NOW())`, (err, result) => {
                        if(err) console.log(err)
                })
            }
        }
    })
})


/* Finishing a ticket and set it as closed in database (technicians only),
    and record the action in tickets_updates table */
router.put("/finish", (req, res) => {
    jwt.verify(req.body.token, process.env.secret, (err, result) => {
        if(err) console.log(err)
        
        if(result.catg == "technicians"){
            if(result.privilege == "super"){
                pool.query(`UPDATE tickets SET technician = "${result.username}", status = "closed", closed_at = NOW(), 
                    comment = "${req.body.comment}", closed_by = "${result.username}" WHERE id = "${req.body.ticket}" 
                    and status = "open"`, (err, result) => {
                    if(err) console.log(err)

                })

                pool.query(`INSERT INTO tickets_updates VALUES (NULL, "${req.body.ticket}", 
                    "status", "closed", "${result.username}", NOW())`, (err, result) => {
                        if(err) console.log(err)

                        res.status(200).end()
                })

            }else if(result.privilege == "user"){
                pool.query(`UPDATE tickets SET status = "closed", closed_at = NOW(), comment = "${req.body.comment}",  
                    closed_by = "${result.username}" WHERE id = "${req.body.ticket}" and technician ="${result.username}" and status = "open"`, (err, result) => {
                    if(err) console.log(err)

                })

                pool.query(`INSERT INTO tickets_updates VALUES (NULL, "${req.body.ticket}", 
                    "status", "closed", "${result.username}", NOW())`, (err, result) => {
                        if(err) console.log(err)

                        res.status(200).end()
                })
            }
        }else{
            res.end()
        }
    })
})


// Re-open a closed ticket in database and record the action in tickets_updates table (privileged technicians only)
router.put("/open", (req, res) => {
    jwt.verify(req.body.token, process.env.secret, (err, result) => {
        if(err) console.log(err)
        
        if(result.catg == "technicians"){
            if(result.privilege == "super"){
                pool.query(`UPDATE tickets SET status = "open", closed_by = "", comment = "",
                    closed_at = NULL WHERE id = "${req.body.ticket}"`, (err, result) => {
                        if(err) {console.log(err);
                        
                        res.json({status: false}) }
                })

                pool.query(`INSERT INTO tickets_updates VALUES (NULL, "${req.body.ticket}", 
                    "status", "open", "${result.username}", NOW())`, (err, result) => {
                        if(err) console.log(err)
                })
            }
        }
    })
})


module.exports = router;
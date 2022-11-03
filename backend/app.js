const express = require("express")
const cookieParser = require("cookie-parser")
const path = require("path")
const cors = require("cors")
const jwt = require("jsonwebtoken");

const pages_content = require('./apis/pages_content')
const auth = require("./apis/auth")
const login = require("./apis/login")
const users = require("./apis/users")
const depts = require("./apis/departments")
const tickets = require("./apis/tickets")

const app = express()
const port = 5200

app.use(cors())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));

// These endpoints are excluded from access validation
app.use('/pages_content', pages_content)
app.use("/auth", auth)
app.use("/login", login)

/* Checking for access validation for every received request to endpoints below.
    If validation result is true pass the request to intended endpoint 
    with renewed token (new exp time), else end the request and send false result */
app.use((req, res, next) => {
    jwt.verify(req.body.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result){
            jwt.sign({username: result.username, catg: result.catg, privilege: result.privilege, exp: Math.floor(Date.now() / 1000) + (15 * 60)}, 
                process.env.secret, (err, token) => {
                if(err) console.log(err)
                    
                req.body['newToken'] = token
                next()
            })            
        }else{
            res.json({auth: false})
        }
    })
})

app.use('/users', users)
app.use("/depts", depts)
app.use("/tickets", tickets)

app.listen(port, () => console.log(`Server running on port = ${port}`))
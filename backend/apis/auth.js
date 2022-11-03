const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.use(express.urlencoded({extended: true}));
router.use(express.json())


/* Checking for access validation. If validation result is true return
    renewed token (new exp time), else end the request and send false result */
router.post("/", (req, res) => {
    jwt.verify(req.body.token, process.env.secret, (err, result) => {
        if(err) console.log(err)

        if(result){
            jwt.sign({username: result.username, catg: result.catg, privilege: result.privilege, exp: Math.floor(Date.now() / 1000) + (15 * 60)}, 
                process.env.secret, (err, token) => {
                if(err) console.log(err)

                res.json({auth: true, newToken: token, username: result.username, catg: result.catg, privilege: result.privilege})
            })
        }else{
            res.json({auth: false})
        }
    })
})


module.exports = router
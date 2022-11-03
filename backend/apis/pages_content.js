const express = require('express')
const mysql = require('mysql')

const router = express.Router()
const pool = mysql.createPool(JSON.parse(process.env.database))

// Retrieving a page content from database based on desired language
router.get('/:page/:lang', (req, res) => {
    pool.query(`SELECT element, ${req.params.lang} AS value FROM pages_content WHERE page = '${req.params['page']}'`, 
        (err, content) => {
        if(err) console.log(err)

        res.json({content: content})
    })
})


module.exports = router
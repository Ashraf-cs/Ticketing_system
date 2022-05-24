const express = require("express")
const login = require("./routes/login")
const technicians = require("./routes/technicians")
const employees = require("./routes/employees")
const companies = require("./routes/companies")
const tickets = require("./routes/tickets")
const cookieParser = require("cookie-parser")
const path = require("path")

const app = express()
const port = process.env.PORT || 3100

app.set("view engine", "hbs")
app.set("views", "./views")

app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));
app.use("/login", login)
app.use("/technicians", technicians)
app.use("/employees", employees)
app.use("/companies", companies)
app.use("/tickets", tickets)

app.listen(port, () => console.log(`Server running on port = ${port}`))
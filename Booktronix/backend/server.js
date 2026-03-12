const express = require("express")
const mysql = require("mysql")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

const db = mysql.createConnection({

host:"localhost",
user:"root",
password:"your_password",
database:"Booktronix"

})

db.connect(function(err){

if(err)
{
console.log(err)
}
else
{
console.log("MySQL Connected")
}

})

// REGISTER API (ADD HERE)
app.post("/register",(req,res)=>{

const {first_name,last_name,email,password} = req.body

const sql =
"INSERT INTO users(first_name,last_name,email,password) VALUES(?,?,?,?)"

db.query(sql,[first_name,last_name,email,password],(err,result)=>{

if(err)
{
console.log(err)
res.send("Error")
}
else
{
res.send("Registration Successful")
}

})

})

// LOGIN API - Track user login
app.post("/login",(req,res)=>{

const {email, password} = req.body

const sql = "SELECT id, first_name, last_name, email FROM users WHERE email = ? AND password = ?"

db.query(sql,[email, password],(err,result)=>{

if(err)
{
console.log(err)
res.send("Error")
}
else if(result.length > 0)
{
// Update last_login timestamp
const updateSql = "UPDATE users SET last_login = NOW() WHERE email = ?"
db.query(updateSql,[email],(err,updateResult)=>{
if(err) console.log("Error updating login time:", err)
})

res.json({
success: true,
message: "Login Successful",
user: result[0]
})
}
else
{
res.json({
success: false,
message: "Invalid email or password"
})
}

})

})

// ORDERS API
app.post("/orders", (req, res) => {
  console.log("Order received:", req.body)
  const {user_email, order_number, total, status, order_details} = req.body

  // First, get user_id from email
  const userQuery = "SELECT id FROM users WHERE email = ?"
  
  db.query(userQuery, [user_email], (err, results) => {
    if (err) {
      console.log("User lookup error:", err)
      return res.send("Error looking up user: " + err.message)
    }
    
    let user_id = null
    if (results && results.length > 0) {
      user_id = results[0].id
    }
    
    // Now insert the order with the user_id (or null if not found)
    const orderSql = "INSERT INTO orders(order_number, user_id, total, status) VALUES(?, ?, ?, ?)"
    
    db.query(orderSql, [order_number, user_id, total, status], (err, result) => {
      if (err) {
        console.log("Order insertion error:", err)
        res.send("Error inserting order: " + err.message)
      } else {
        console.log("Order inserted successfully:", result)
        res.send("Order placed successfully")
      }
    })
  })
})

app.listen(3000, function() {
  console.log("Server Started on port 3000")
})
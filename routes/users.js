const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

/* POST create new user*/
router.post('/register', function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;
  let newUser = true;

  console.log("asdjkdashk")

  //verify email & password in post body
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password required"
    })
    return
  }

  const queryUsers = req.db.from("users").select("*").where("email", "=", email);
  queryUsers
    .then((users) => {
      if (users.length > 0) {
        newUser = false; //user already exists
        return;
      }

      //insert user into DB
      const saltRounds = 10;
      const hash = bcrypt.hashSync(password, saltRounds);
      return req.db.from("users").insert({ email, hash, username });
    })
    .then(() => {
      if (newUser === true) {
        res.status(201).json({ success: true, messsage: "User created successfully" })
      }
      else {
        res.status(409).json({ success: false, messsage: "User already exists" })
      }
    })
})

// POST login request
router.post('/login', function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  //verify body
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed"
    })
    return;
  }

  const queryUsers = req.db.from("users").select("*").where("email", "=", email);
  queryUsers
    .then((users) => {
      if (users.length === 0) {
        res.status(404).json({ success: false, messsage: "User not found" });
        return;
      }

      // Compare password hashes
      const user = users[0];
      return bcrypt.compare(password, user.hash);
    })
    .then((match) => {
      if (!match) {
        res.status(401).json({ success: false, messsage: "Incorrect password" });
        return;
      }

      // Create and return JWT token
      const secretKey = "secret key";
      const expires_in = 60 * 60 * 24; //1 Day
      const exp = Date.now() + expires_in * 1000;
      const token = jwt.sign({ email, exp }, secretKey);
      res.json({ token_type: "Bearer", token, expires_in })
    })
})

module.exports = router;

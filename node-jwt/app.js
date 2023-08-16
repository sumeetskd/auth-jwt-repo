const express = require("express");
const app = express();
const mongoose = require("mongoose");
const URL_MONGO =
  "mongodb+srv://root1:WrKkjCSANkD11tBJ@cluster0.oi4x15l.mongodb.net/jwt-tutorial?retryWrites=true&w=majority";
const User = require("./model/users"); //User model of collection Users is imported
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const crypto = require("crypto");

const password = "Password used to generate key";
// Use the async `crypto.scrypt()` instead.
const key = crypto.scryptSync(password, "salt", 24);
// The IV is usually passed along with the ciphertext.
const iv = Buffer.alloc(16, 0); // Initialization vector.

const algo = "aes-192-cbc";
const cipher = crypto.createCipheriv(algo, key, iv);
const decipher = crypto.createDecipheriv(algo, key, iv);

//
const jwt = require("jsonwebtoken");
const jwtKey = "jwt";
//

mongoose
  .connect(URL_MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.warn("Connected"));

app.post("/register", jsonParser, (req, res) => {

  let encrypted = cipher.update(req.body.password, "utf8", "hex") + cipher.final("hex");
  //encrytion of password is done in the above statement - using an encrytion algorithm and password key

  console.warn(encrypted);
  console.log(encrypted.length)

  //decipher
  // const encrypted1 = "e5f79c5915c02171eec6b212d5520d44480993d7d622a7c4c2da32f6efda0ffa";
  // let decrypted = decipher.update(encrypted, "hex", "utf8");
  // decrypted += decipher.final("utf8");
  // console.log(decrypted);

  // let decipher = crypto.createDecipheriv(algo, key, iv);
  // let decrypted = decipher.update(test, "hex", "utf8");
  // decrypted += decipher.final("utf8");
  // console.log("Decrypted: ", decrypted);

  const data = new User({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    email: req.body.email,
    address: req.body.address,
    password: encrypted,
  });

  data
    .save()
    .then((result) => {
      jwt.sign({ result }, jwtKey, { expiresIn: "300s" }, (err, token) => {
        res.status(201).json({ token });
      });
      //res.status(201).json(result)
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/login", jsonParser, (req, res) => {
  User.findOne({ email: req.body.email }).then((data) => {
    console.warn(data);
    console.log('password db: length - ', data.password.length);
    let dbPwd = data.password;
    let decrypted = decipher.update(dbPwd, "hex", "utf8");
    decrypted += decipher.final("utf8");
    console.log(decrypted);

    console.log("Decrypted: ", decrypted);
    if (req.body.password === decrypted) {
      jwt.sign({ data }, jwtKey, { expiresIn: "300s" }, (err, token) => {
        res.status(201).json({ token });
      });
    }
    // res.json(data);
  });
});

app.get("/", (req, res) => {
  res.end("Hello");
});

app.listen(5000);

const express = require("express")
const router = express.Router()
const User = require("../models/User")
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetchuser = require("../middleware/fetchuser")

const saltRounds = 10;
const JWT_SECRET = "SignatureForWebToken"

//Route 1 : Adding a User using: POST "/api/auth/createuser" , No login Required
router.post("/createuser", [body('email', "Enter a Valid Email").isEmail().isLength({ min: 5 }),
body('name', "Enter full Name").isLength({ min: 3 }),
body('password', "Password must not be less than 5 Characters").isLength({ min: 5 })], async function (req, res) {
    
    // Validating the fields 
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    let usr = await User.findOne({ email: req.body.email })
    if (usr) {
        return res.status(400).json({ success, error: "Sorry a user with this email already exists." })
    }
    const myPlaintextPassword = req.body.password
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(myPlaintextPassword, salt, function (err, hash) {
            const user = new User({ email: req.body.email, name: req.body.name, password: hash })
            user.save(function (err) {
                if (err) {
                    console.log(err)
                } else {
                    const data = {
                        user: {
                            id: user.id
                        }
                    }
                    const authToken = jwt.sign(data, JWT_SECRET)
                    success = true
                    res.status(200).json({ success, authToken: authToken })
                }
            })
        });
    });

})

// Route 2 : Authenticating a User using: POST "/api/auth/login"
router.post("/login", [body('email', "Enter a Valid Email").isEmail().isLength({ min: 5 }),
body('password', "Password cannot be blank").exists()], async function (req, res) {
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    const { email, password } = req.body
    try {
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ success, error: "Please try to login with current Credentials." })
        }
        bcrypt.compare(password, user.password, function (err, result) {
            if (!result) {
                return res.status(400).json({ error: "Please try to login with current Credentials." })
            }

            const data = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET)
            success = true
            res.status(200).json({ success, authToken: authToken })
        });

    } catch (error) {
        console.log(error.message)
        res.status(500).send("Some Error Occured.")
    }
})

//Route 3 : Get logging in USer Details using: POST "/api/auth/getuser" , login Required
router.post("/getuser", fetchuser, async function (req, res) {

    try {
        let userId = req.user.id
        const user = await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Some Error Occured.")
    }
})

module.exports = router
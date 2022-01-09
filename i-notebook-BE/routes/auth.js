const bcrypt = require('bcryptjs/dist/bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator');
const User = require("../models/User");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "WowNodeJ$isGreat";

//ROUTE 1 : Create user login: "api/auth/createuser". No login required
router.post('/createuser',

    [body('email').isEmail(),
    body('password').isLength({min:5})]

    , async (req, res) => {
        // console.log(req.body);
        // const user = User(req.body);
        // user.save();

        //Find validation error , return bad request and errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json( {errors: errors.array()} )
        }

        //Using async await instead of this
        // User.create({
        //     name: req.body.name,
        //     email: req.body.email,
        //     password: req.body.password
        // }).then(user => res.json(user))
        // .catch(err => {
        //     console.log(err);
        //     res.send({error: "Error occured", message: err.message})   
        // });

        //Check if user with this email exists
        try {
            //Check if email already exists
            let user = await User.findOne({email: req.body.email});
            console.log(user);
            if (user) {
                return res.status(400).json({error: "Sorry a user with same email already exist"});
            }

            // Adding security to password
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);
            // Create a new user
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPass
            })

            const data = {
                user: {
                    id: user.id
                }
            }
            // Generating auth token to return to user
            const authtoken = jwt.sign(data, JWT_SECRET);
            // We are returning the user it is not a good practice 
            // Instead we return "Session Token" "Json Web Token"  => Learning "JWT web token"

            // res.json(user); //  res.send(req.body); --> this is done in .then()
            res.json({authtoken});
        } catch (error) {
            console.error(error);  // Ideally use logger, SQS
            res.status(500).send("Some error occured")
        }

  })


//ROUTE 2 : Create user login: "api/auth/login". No login required
router.post('/login',

    body('email').isEmail(),
    body('password').isLength({min:5})

    , async (req, res) => {
        //Find validation error , return bad request and errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json( {errors: errors.array()} )
        }    

        try {
            const {email, password} = req.body
            let user = await User.findOne({email});
            console.log(user);
            if (!user) {
                return res.status(400).json({error: "Invalid Credentials"});
            }

            const passwordCompare = await bcrypt.compare(password, user.password);
            if (!passwordCompare) {
                return res.status(400).json({error: "Invalid Credentials"});
            }

            const data = {
                user: {
                    id: user.id
                }
            }
            // Generating auth token to return to user
            const authtoken = jwt.sign(data, JWT_SECRET);
            res.json({authtoken});
        } catch (error) {
            console.error(error);  // Ideally use logger, SQS
            res.status(500).send("Internal Server Error")
        }
    }
)


//ROUTE 3 : Get User Values login: "api/auth/getuser". Login required
router.post('/getuser',
    fetchuser
    , async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId).select("-password");
            res.json({user})
        } catch (error) {
            console.error(error);  // Ideally use logger, SQS
            res.status(500).send("Internal Server Error")
        }
    }
)
module.exports = router
console.log("Inside User function")

const express = require('express');
const User = require('../models/User')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const JWT_SECRET = 'Harisisagoodb$oy'
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');





// Route 1: Create a User using : POST "/api/auth/createuser" . No login required 
router.post('/createuser', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Enter a valid password').isLength({ min: 5 })
], async (req, res) => {
  success = false;
  // Tf there are errors,return bad request and the errors
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success , error: errors.array() })
  }

  try {
    // Check whether the user with this email exist already


    let user = await User.findOne({ email: req.body.email })
    if (user) {
      return res.status(400).json({ success , error: 'Sorry a user with this email already exist' })
    }
    const salt = await bcrypt.genSalt(10)
    const secPass = await bcrypt.hash(req.body.password, salt)
    // Create a new user
    user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email
    })
    const data = {
      user: {
        id: user.id
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET)
     success = true;
    res.json({ success ,  authToken })
    // res.json(user)


  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal sever error')
  }
})


//Route 2: Authenticate a User using : POST "/api/auth/login" . No login required 
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists()

], async (req, res) => {
  success = false;
  // Tf there are errors,return bad request and the errors
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() })
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      success = false;
      return res.status(400).json({ error: 'Please try to login with correct credentials' })
    }

    const passwordCompare = await bcrypt.compare(password, user.password)
    if (!passwordCompare) {
      success = false;
      return res.status(400).json({ error: 'Please try to login with correct credentials' })
    }

    const data = {
      user: {
        id: user.id
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success, authToken })


  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal sever error')
  }

})

//Route 3: Get loggedin User details using : POST "/api/auth/getuser" .Login required 

router.post('/getuser', fetchuser, async (req, res) => {

  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)

  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal sever error')
  }

})

module.exports = router
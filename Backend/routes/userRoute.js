const { registerUser, loginUser,getUserProfile } = require('../controllers/userController');
const express = require('express');
const router = express.Router();

// router.get('/',(req,res) => {
//     res.send('Hello world');
// });     
 
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get("/profile", getUserProfile);

module.exports = router;
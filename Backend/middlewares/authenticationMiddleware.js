const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Assuming you have a user model

const SECRET_KEY = process.env.JWT_SECRET || 'MY_SECRET';

const authenticationMiddleware = async (req, res, next) => {

    const token = req.headers.authorization?.split(' ')[1];
    // const token = req.headers('authorization')?.replace('Bearer ', '');   // both are same 

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    } 
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.email = decoded.email;
        next();
    }catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

module.exports = authenticationMiddleware;
    

   
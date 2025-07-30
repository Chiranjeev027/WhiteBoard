const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    // match: [
    //   /^\w+([\.+-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    //   'Please enter a valid email address'
    // ]
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  timestamps: true, // ✅ Automatically adds createdAt and updatedAt
  collection: 'users'
});

userSchema.statics.register = async function (name, email, password) {
  try {

    // ✅ Email validation using validator
    if (!validator.isEmail(email)) {
      throw new Error('Invalid email format');
    }

    // ✅ Password strength check using validator
    if (!validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 0,
      minUppercase: 0,
      minNumbers: 0,
      minSymbols: 0
    })) {
      throw new Error(
        // 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character'
        'Password must be at least 8 characters long'
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new this({ 
        name, 
        email, 
        password : hashedPassword  
    });
    return await newUser.save(); 
  } catch (error) {
    throw new Error('User registration failed: ' + error.message);
  }
};

userSchema.statics.getUser = async function (email) {
  try {
    // return await this.find();
    const users = await this.findOne({email});
    return users;   
  } catch (error) {
    throw new Error('Fetching users failed: ' + error.message);
  }
};


userSchema.statics.login = async function (email, password) {
  try {
    const user = await this.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid login credentials');
    }
    return user;
  } catch (error) {
    throw new Error('Login failed: ' + error.message);
  }
} 

module.exports = mongoose.model('User', userSchema);

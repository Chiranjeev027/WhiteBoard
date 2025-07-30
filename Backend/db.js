const mongoose = require('mongoose');

const connectionString = process.env.MONGO_URI;

const connectionParams ={
    useNewUrlParser: true,
    useUnifiedTopology: true
}

const connectToDatabase = async () =>{
    try{
        await mongoose.connect(connectionString, connectionParams);
        console.log('Connected to database');
    } catch (error){
        console.log(error);
    }
}

module.exports = connectToDatabase;    
const mongoose = require("mongoose");

// 1. Database Connection
const connectDB = async () => {
  return await mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("MongoDB Connected");
    })
    .catch(() => {
      console.log("Database Eror");
    });
};


module.exports = {mongoose , connectDB }

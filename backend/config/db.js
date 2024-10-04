const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // DB USER Password 7Bg6UtKytqT3c1s4
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error(error.message);
    process.exit(1); // Exit process if there's an error
  }
};

module.exports = connectDB;


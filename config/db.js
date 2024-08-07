
const mongoose = require('mongoose');
// const userModel = require('../models/user.model');
require('dotenv').config({ path: './.env' });

mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  // createAdminUser();
})
.catch(err => {
  console.error('Could not connect to MongoDB', err);
});

// const createAdminUser = async () => {
//   try {
//     const username = process.env.ADMIN_USERNAME || 'admin';
//     const password = process.env.ADMIN_PASSWORD || 'adminpassword';

//     const existingUser = await userModel.findOne({ username });
//     if (existingUser) {
//       console.log('Admin user already exists');
//       return;
//     }

//     const adminUser = new userModel({ username, password });
//     await adminUser.save();
//     console.log('Admin user created successfully');
//   } catch (error) {
//     console.error('Error creating admin user:', error);
//   }
// };
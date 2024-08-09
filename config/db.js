const mongoose = require('mongoose');
const userModel = require('../models/user.model');
require('dotenv').config({ path: './.env' });

mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  createInitialUsers();
})
.catch(err => {
  console.error('Could not connect to MongoDB', err);
});

const createInitialUsers = async () => {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword';
    const memberUsername = process.env.MEMBER_USERNAME || 'member';
    const memberPassword = process.env.MEMBER_PASSWORD || 'memberpassword';


    const existingAdminUser = await userModel.findOne({ username: adminUsername });
    if (existingAdminUser) {
      console.log('Admin user already exists');
    } else {
      const adminUser = new userModel({ username: adminUsername, password: adminPassword, role: 'admin' });
      await adminUser.save();
      console.log('Admin user created successfully');
    }


    const existingMemberUser = await userModel.findOne({ username: memberUsername });
    if (existingMemberUser) {
      console.log('Member user already exists');
    } else {
      const memberUser = new userModel({ username: memberUsername, password: memberPassword, role: 'member' });
      await memberUser.save();
      console.log('Member user created successfully');
    }
  } catch (error) {
    console.error('Error creating initial users:', error);
  }
};

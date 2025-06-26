const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config(); // To use environment variables

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gestion-fournisseurs";

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const seedAdmin = async () => {
    await connectDB();

    try {
        const adminEmail = 'admin@example.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('Admin user already exists.');
            mongoose.connection.close();
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const adminUser = new User({
            name: 'Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'Admin',
        });

        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log(`Email: ${adminEmail}`);
        console.log('Password: password123');

    } catch (error) {
        console.error('Error seeding admin user:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedAdmin(); 
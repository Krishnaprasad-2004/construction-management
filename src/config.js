const mongoose = require('mongoose');

const connect = mongoose.connect("mongodb://localhost:27017/Login-tut");

connect.then(() => {
    console.log("Database Connected Successfully");
}).catch(() => {
    console.log("Database Connection Failed");
});

// Schema for Users (Login Information)
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    password: { type: String, required: true }
});

// Schema for Owners (Registration Information)
const OwnerSchema = new mongoose.Schema({
    ownerName: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    projectType: { type: String, required: true },
    budget: { type: Number, required: true },
    location: { type: String, required: true },
    specificNeeds: { type: String }
});

const CommunicationSchema = new mongoose.Schema({
    constructorName: { type: String, required: true },
    ownerName: { type: String, required: true },
    progressUpdate: { type: String, required: true },
    demands: { type: String },
    budgetIncrease: { type: Number, required: true },
    reason: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Create collections
const UserCollection = mongoose.model("users", UserSchema);
const OwnerCollection = mongoose.model("owners", OwnerSchema);
const Communication = mongoose.model('Communication', CommunicationSchema);

module.exports = { UserCollection, OwnerCollection, Communication};

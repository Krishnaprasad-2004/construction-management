require("dotenv").config();
const express = require("express");
const path = require("path");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const { UserCollection, OwnerCollection, Communication } = require("./config");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static("public"));

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// **Render Pages**
app.get("/signup", (req, res) => res.render("signup"));
app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));
app.get("/payment", (req, res) => res.render("payment"));
app.get("/communication", (req, res) => res.render("communication"));

// **Signup Route**
app.post("/signup", async (req, res) => {
    try {
        const { email, role, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserCollection({ email, role, password: hashedPassword });
        await newUser.save();
        res.render("login");
    } catch (error) {
        console.error("Error signing up:", error);
        res.status(500).send("Error creating account.");
    }
});

// **Login Route**
app.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await UserCollection.findOne({ email });
        if (!user) return res.status(400).send("User not found.");
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send("Invalid credentials.");
        if (user.role !== role) return res.status(403).send("Incorrect role selection.");
        res.render("home");
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).send("Error logging in.");
    }
});

// **Registration Route**
app.post("/register", async (req, res) => {
    try {
        const { ownerName, username, password, projectType, budget, location, specificNeeds } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newOwner = new OwnerCollection({
            ownerName,
            username,
            password: hashedPassword,
            projectType,
            budget,
            location,
            specificNeeds
        });
        await newOwner.save();
        res.send("Registration successful!");
    } catch (error) {
        console.error("Error registering owner:", error);
        res.status(500).send("Error registering owner.");
    }
});

// **Communication Route**
app.post("/communication", async (req, res) => {
    try {
        const { constructorName, ownerName, progressUpdate, demands, budgetIncrease, reason } = req.body;
        const newCommunication = new Communication({
            constructorName,
            ownerName,
            progressUpdate,
            demands,
            budgetIncrease,
            reason
        });
        await newCommunication.save();
        res.send("Communication data saved successfully!");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error saving communication data.");
    }
});

app.post("/payment/orders", async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options); // Fixed: Use razorpay instead of instance
        res.json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).send("Error creating order");
    }
});

app.post("/payment/success", async (req, res) => {
    try {
        const { orderCreationId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
        const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
        const digest = shasum.digest("hex");
        if (digest !== razorpaySignature) {
            return res.status(400).json({ msg: "Transaction not legit!" });
        }
        res.json({ msg: "Payment successful!" });
    } catch (error) {
        console.error("Payment verification failed:", error);
        res.status(500).send("Payment verification failed");
    }
});

// **Start Server**
const port = 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
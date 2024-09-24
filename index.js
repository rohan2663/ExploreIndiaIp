const express = require("express");
const { MongoClient } = require("mongodb");
const fs = require("fs");
const ejs = require("ejs");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./"));

// MongoDB Atlas connection URI
const uri =
  "mongodb+srv://rohankumar2663:rohan2663@cluster0.rk009hd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a new MongoClient
const client = new MongoClient(uri);

// Connect to MongoDB Atlas
client
  .connect()
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err);
    process.exit(1);
  });

// Set EJS as view engine
app.set("view engine", "ejs");

// Start server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port`);
});

// Middleware to parse JSON bodies

app.get("/index.html", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  let data = fs.readFileSync("./index.html");
  res.end(data);
});

app.get("/signin.html", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  let data = fs.readFileSync("./signin.html");
  res.end(data);
});

// Route to handle signup data
app.post("/signup", async (req, res) => {
  const userData = req.body;
  const collection = client.db("IPproject").collection("Login");
  try {
    const result = await collection.insertOne(userData);
    // console.log("User signed up:", result.insertedId);
    res.redirect("/signin.html");
  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).send("<h1>Signup failed</h1>");
  }
});

// Route to handle login data
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const collection = client.db("IPproject").collection("Login");
  //console.log(username);

  try {
    const user = await collection.findOne({
      email: username,
      password: password,
    });
    if (user) {
      res.render("01.ejs", { user });
    } else {
      res.send("<h1>Login not successful</h1>");
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).send("<h1>Login failed</h1>");
  }
});

app.get("/afterlogin", (req, res) => {
  res.redirect("/signin.html");
});

// Route to handle form submissions and save data to contact.json
// Route to handle form submissions and save data to MongoDB and contact.json
app.post("/submit", async (req, res) => {
  const contactData = req.body; // Get the data from the request body

  // Connect to MongoDB Atlas
  const collection = client.db("IPproject").collection("Contact");

  try {
    // Insert the new contact data into the MongoDB collection
    await collection.insertOne(contactData);

    // Load existing contact data from contact.json
    let contactArray = [];
    if (fs.existsSync("./contact.json")) {
      contactArray = JSON.parse(fs.readFileSync("./contact.json", "utf-8"));
    }

    // Add the new contact data to the array
    contactArray.push(contactData);

    // Save the updated array back to contact.json
    fs.writeFileSync("./contact.json", JSON.stringify(contactArray, null, 2));

    // Respond with a success message
    res.setHeader("Content-Type", "text/html");
    res.status(200).send("<h1>We will contact you soon.</h1>");
  } catch (error) {
    console.error("Error submitting contact data:", error);
    res.status(500).send("<h1>Failed to submit contact data.</h1>");
  }
});

// Route to handle password change
app.get("/change", async (req, res) => {
  const { uname, password } = req.query;
  const collection = client.db("IPproject").collection("Login");

  try {
    const result = await collection.updateOne(
      { fullname: uname },
      { $set: { password } }
    );
    if (result.modifiedCount > 0) {
      res.status(200).send("<h1>Password changed</h1>");
    } else {
      res.status(404).send("<h1>User not found</h1>");
    }
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).send("<h1>Password change failed</h1>");
  }
});

app.use((req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(404).send("<h1>404 not found</h1>");
});

const express = require("express");
const { MongoClient } = require("mongodb");
const fs = require("fs");
const ejs = require("ejs");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./"));

// MongoDB Atlas connection URI
const uri =
  "mongodb+srv://rpurushotham0143:Puru0143@cluster0.ivuxpys.mongodb.net/IPproject?retryWrites=true&w=majority&appName=Cluster0";

// Create a new MongoClient
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
app.listen(1010, () => {
  console.log(`Server started on port 1010`);
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

  try {
    const user = await collection.findOne({ fullname: username, password });
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

//This is using session code

// const express = require('express');
// const session = require('express-session');
// const { error } = require('console');
// const app = express();
// const fs = require('fs');
// const { exit } = require('process');
// const { json } = require('stream/consumers');

// // Set up session middleware
// app.use(session({
//     secret: 'your_secret_key',
//     resave: false,
//     saveUninitialized: true
// }));

// // Middleware to parse JSON bodies
// app.use(express.json());
// app.use(express.static("./"));

// app.get('/index.html', (req, res) => {
//     res.setHeader("Content-Type", "text/html");
//     let data = fs.readFileSync("./index.html");
//     res.end(data);
// });

// app.get('/signin.html', (req, res) => {
//     res.setHeader("Content-Type", "text/html");
//     let data = fs.readFileSync("./signin.html");
//     res.end(data);
// });

// // Signup endpoint
// app.get('/signup', (req, res) => {
//     // Your signup logic here

//     // Assuming signup is successful
//     req.session.isLoggedIn = true; // Set session variable after signup
//     res.send('Signup successful');
// });

// // Login endpoint
// app.get('/login', (req, res) => {
//     if (!req.session.isLoggedIn) {
//         res.status(401).send('You need to signup first.');
//     } else {
//         // Your login logic here
//         res.send('Login successful');
//     }
// });

// app.get('/getData', (req, res) => {
//     if (!req.session.isLoggedIn) {
//         res.status(401).send('You need to signup first.');
//         return;
//     }
//     let { fullname, email, password } = req.query;
//     let array = [];
//     let data = fs.readFileSync('./login.json', 'utf-8');
//     array = JSON.parse(data);

//     // Check if user already exists
//     let userExists = array.some(item => item.fullname === fullname && item.email === email);

//     if (userExists) {
//         console.log("User already exists");
//         res.setHeader("Content-Type", "application/json");
//         res.setHeader('Access-Control-Allow-Origin', '*');
//         res.end(JSON.stringify({ exists: true }));
//     } else {
//         array.push({ fullname, email, password });
//         fs.writeFileSync('./login.json', JSON.stringify(array));
//         console.log("Data received successfully");
//         res.setHeader("Content-Type", "application/json");
//         res.setHeader('Access-Control-Allow-Origin', '*');
//         res.end(JSON.stringify({ exists: false }));
//     }
// });

// app.get('/xyz', (req, res) => {
//     if (!req.session.isLoggedIn) {
//         res.status(401).send('You need to signup first.');
//         return;
//     }
//     let arrayofObj = JSON.parse(fs.readFileSync('./login.json', 'utf-8'));
//     let username = req.query.username;
//     let password = req.query.password;
//     let user = arrayofObj.find(obj => obj.fullname === username && obj.password === password);

//     if (user) {
//         res.setHeader("Content-Type", "application/json");
//         res.setHeader('Access-Control-Allow-Origin', '*');
//         res.json({ message: "login successful", user: user });
//     } else {
//         res.setHeader("Content-Type", "application/json");
//         res.setHeader('Access-Control-Allow-Origin', '*');
//         res.send(json({ message: "login not successful" }));
//     }
// });

// // Route to handle form submissions and save data to contact.json
// app.post('/submit', (req, res) => {
//     if (!req.session.isLoggedIn) {
//         res.status(401).send('You need to signup first.');
//         return;
//     }
//     const contactData = req.body; // Get the data from the request body

//     // Load existing contact data from contact.json
//     let contactArray = [];
//     if (fs.existsSync('./contact.json')) {
//         contactArray = JSON.parse(fs.readFileSync('./contact.json', 'utf-8'));
//     }

//     // Add the new contact data to the array
//     contactArray.push(contactData);

//     // Save the updated array back to contact.json
//     fs.writeFileSync('./contact.json', JSON.stringify(contactArray, null, 2));

//     // Respond with a success message
//     res.setHeader("Content-Type", "application/json");
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.status(200).send({ message: "We will contact you soon." });
// });

// app.get('/change', (req, res) => {
//     if (!req.session.isLoggedIn) {
//         res.status(401).send('You need to signup first.');
//         return;
//     }
//     let arrayofObj = JSON.parse(fs.readFileSync('./login.json', 'utf-8'))
//     arrayofObj.forEach((obj) => {
//         if (obj.uname == req.query.uname) {
//             obj.password = req.query.password
//             const updatedData = JSON.stringify(arrayofObj);
//             fs.writeFileSync('./login.json', updatedData, 'utf-8');
//             res.setHeader("Content-Type", "application/json");
//             res.setHeader('Access-Control-Allow-Origin', '*');
//             res.end(JSON.stringify({ message: "Password changed" }))
//         }
//     })
// });

// app.use((req, res) => {
//     res.setHeader("Content-Type", "text/html");
//     res.status(404).send("<h1>404 not found</h1>");
// });

// app.listen(1010, () => {
//     console.log("server started 1010");
// });

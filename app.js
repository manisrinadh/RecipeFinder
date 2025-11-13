const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const app = express();
const PORT = 3000;
const serviceAccount = require("./serviceAccount.json");

// Firebase Admin SDK initialization
initializeApp({
  credential: cert(serviceAccount),
});
app.use(express.static('public'));

const db = getFirestore();

// Middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.get("/recipe", (req, res) => {
    res.render("recipe");
  });
// Routes
 app.get("/",(req,res)=>{
   res.render("home");
})
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/recipe", (req, res) => {
  res.render("recipe"); // Render the recipe.ejs template
});

app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    // Add user details to Firestore
    await db.collection("students").add({
      email: email,
      password: password,
    });

    // Redirect to the recipe page after successful signup
    res.redirect("/recipe");
  } catch (error) {
    console.log("Error creating new user:", error);
    res.send("Error creating user: " + error.message);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Query Firestore for a user with the given email
    const usersSnapshot = await db.collection("students").where("email", "==", email).get();

    // Check if user exists
    if (usersSnapshot.empty) {
      return res.send("Invalid login credentials.");
    }

    // Check if the password matches
    let userFound = false;
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.password === password) {
        userFound = true;
      }
    });

    if (userFound) {
      // Redirect to the recipe page after successful login
      res.redirect("/recipe");
    } else {
      res.send("Invalid login credentials.");
    }
  } catch (error) {
    console.log("Error logging in user:", error);
    res.send("Error logging in: " + error.message);
  }
});

app.listen(2000, () => {
  console.log(`Server running on http://localhost:2000`);
});

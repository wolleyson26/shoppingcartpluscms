const express = require("express");
const path = require("path");
const _ = require("lodash");
const mongoose = require("mongoose");
const db = require("./config/db");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const passport = require("passport");

// connect to db
mongoose
  .connect(db.mongoURI, { useNewUrlParser: true, useFindAndModify: false })
  .then(console.log("MongoDB Connected.."))
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });

// init app
const app = express();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: false }));

// Session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
    // cookie: { secure: true }
  })
);

// Express fileUpload middleware
// app.use(fileUpload);

// Express messages middleware
app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.locals.errors = null;

// Get page model
const Page = require("./models/page");

// Get all pages to pass to header.ejs
Page.find({})
  .sort({ sorting: 1 })
  .exec((err, pages) => {
    if (err) console.log(err);

    app.locals.pages = pages;
  });

// Get category model
const Category = require("./models/category");

// Get all categories to pass to header.ejs
Category.find({}).exec((err, categories) => {
  if (err) console.log(err);

  app.locals.categories = categories;
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// set public folder
app.use(express.static(path.join(__dirname, "public")));

// Passport config
require("./config/passport")(passport);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("*", (req, res, next) => {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
});

// Set routes
const pages = require("./routes/pages");
const products = require("./routes/products");
const cart = require("./routes/cart");
const users = require("./routes/users");
const adminPages = require("./routes/admin_pages");
const adminCategories = require("./routes/admin_categories");
const adminProducts = require("./routes/admin_products");

app.use("/admin/pages", adminPages);
app.use("/admin/categories", adminCategories);
app.use("/admin/products", adminProducts);
app.use("/products", products);
app.use("/cart", cart);
app.use("/users", users);
app.use("/", pages);

// start the server
const port = 5008;
app.listen(port, () => console.log("server started on port " + port));

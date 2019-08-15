const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

// Get User model
const User = require("../models/user");

/*
 * GET Register
 */
router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register"
  });
});

/*
 * POST Register
 */
router.post(
  "/register",
  [
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("username", "Username is required")
      .not()
      .isEmpty(),
    check("password", "Password is required")
      .not()
      .isEmpty(),
    check("password2").custom((password2, { req }) => {
      if (password2 !== req.body.password) {
        throw new Error("Passwords do not match!");
      }
      return true;
    })
  ],
  (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("register", {
        user: res.locals.user,
        errors: errors.array(),
        title: "Register"
      });
    } else {
      User.findOne({ username }, (err, user) => {
        if (err) console.log(err);
        if (user) {
          req.flash("danger", "Oops username already exists, choose another");
          res.redirect("/users/register");
        } else {
          let user = new User({
            name: name,
            email: email,
            username: username,
            password: password,
            admin: 0
          });

          bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(user.password, salt, function(err, hash) {
              if (err) console.log(err);

              user.password = hash;

              user.save(function(err) {
                if (err) {
                  console.log(err);
                } else {
                  req.flash("success", "You are now registered!");
                  res.redirect("/users/login");
                }
              });
            });
          });
        }
      });
    }
  }
);

/*
 * GET Login
 */
router.get("/login", (req, res) => {
  if (res.locals.user) res.redirect("/");

  res.render("login", {
    title: "Login"
  });
});

/*
 * GET Logout
 */
router.get("/logout", (req, res) => {
  req.logout();

  req.flash("success", "You are logged out!");
  res.redirect("/users/login");
});

/*
 * POST Login
 */
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

// Exports
module.exports = router;

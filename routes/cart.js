const express = require("express");
const router = express.Router();

// Get Product model
const Product = require("../models/product");

/*
 * GET add product to cart
 */
router.get("/add/:product", (req, res) => {
  const slug = req.params.product;

  Product.findOne({ slug }, function(err, prod) {
    if (err) console.log(err);

    if (typeof req.session.cart === "undefined") {
      req.session.cart = [];
      req.session.cart.push({
        id: prod._id,
        title: slug,
        qty: 1,
        price: parseFloat(prod.price).toFixed(2),
        image: prod.image
      });
    } else {
      let cart = req.session.cart;
      let newItem = true;

      for (let i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
          cart[i].qty++;
          newItem = false;
          break;
        }
      }

      if (newItem) {
        cart.push({
          id: prod._id,
          title: slug,
          qty: 1,
          price: parseFloat(prod.price).toFixed(2),
          image: prod.image
        });
      }
    }

    // console.log(req.session.cart);
    req.flash("success", "Product added!");
    res.redirect("back");
  });
});

/*
 * GET checkout page
 */
router.get("/checkout", (req, res) => {
  if (req.session.cart && req.session.cart.length === 0) {
    delete req.session.cart;
    res.redirect("/cart/checkout");
  }
  res.render("checkout", {
    title: "Checkout",
    cart: req.session.cart
  });
});

/*
 * GET clear cart
 */
router.get("/clear", (req, res) => {
  delete req.session.cart;

  req.flash("success", "Cart cleard!");
  res.redirect("/cart/checkout");
});

/*
 * GET buy now
 */
router.get("/buynow", (req, res) => {
  delete req.session.cart;

  res.sendStatus(200);
});

/*
 * GET update cart product
 */
router.get("/update/:product", (req, res) => {
  const slug = req.params.product;
  const cart = req.session.cart;
  const action = req.query.action;

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].title === slug) {
      switch (action) {
        case "add":
          cart[i].qty++;
          break;
        case "remove":
          cart[i].qty--;
          if (cart[i].qty < 1) cart.splice(i, 1);
          break;
        case "clear":
          cart.splice(i, 1);
          if (cart.length === 0) delete req.session.cart;
          break;
        default:
          console.log("update problem");
          break;
      }
      break;
    }
  }

  req.flash("success", "Cart updated!");
  res.redirect("/cart/checkout");
});

// Exports
module.exports = router;

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
          title: slug,
          qty: 1,
          price: parseFloat(prod.price).toFixed(2),
          image: prod.image
        });
      }
    }

    console.log(req.session.cart);
    req.flash("success", "Product added!");
    res.redirect("back");
  });
});

// Exports
module.exports = router;

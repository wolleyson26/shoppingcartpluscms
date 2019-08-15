const express = require("express");
const router = express.Router();

// Get page model
const Product = require("../models/product");
const Category = require("../models/category");

/*
 * GET all products
 */
router.get("/", (req, res) => {
  Product.find({}, (err, products) => {
    if (err) console.log(err);

    res.render("all_products", { title: "All products", products });
  });
});

/*
 * GET products by category
 */
router.get("/:category", (req, res) => {
  const categorySlug = req.params.category;

  try {
    Category.findOne({ slug: categorySlug }, (err, cat) => {
      Product.find({ category: categorySlug }, async (err, products) => {
        if (err) console.log(err);

        res.render("cat_products", { title: cat.title, products });
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/*
 * GET product details
 */
router.get("/:category/:product", async (req, res) => {
  try {
    const loggedIn = req.isAuthenticated() ? true : false;

    const product = await Product.findOne({ slug: req.params.product });

    if (!product) {
      return res.status(400).json({ msg: "Product do not exist" });
    }

    const { title, gallery } = product;

    await res.render("product", {
      title,
      product,
      gallery,
      loggedIn
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/*
 * GET images
 */
router.get("/product_files/images/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(400).json({ msg: "image not found" });
    }

    res.set("Content-Type", product.image.contentType);

    return res.send(product.image.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Exports
module.exports = router;

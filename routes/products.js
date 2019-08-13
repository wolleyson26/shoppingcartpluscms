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

  Category.findOne({ slug: categorySlug }, async (err, cat) => {
    Product.find({ category: categorySlug }, async (err, products) => {
      if (err) console.log(err);

      res.render("cat_products", { title: cat.title, products });
    });
  });
});

/*
 * GET product details
 */
router.get("/:category/:product", (req, res) => {
  const galleryImages = null

  Product.findOne({ slug: req.params.product }, (err, product) => {
    if (err) console.log(err);

    const g
  })
});

/*
 * GET images
 */
router.get("/image/:productId", async (req, res) => {
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

const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const resizeImg = require("resize-img");

// Get Product model
const Product = require("../models/product");

// Category model
const Category = require("../models/category");

const multer = require("multer");
const storage = multer.diskStorage({
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // Reject a file
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

/*
 * GET Product index
 */
router.get("/", (req, res) => {
  let count;

  Product.countDocuments((err, c) => {
    count = c;
  });

  Product.find((err, products) => {
    res.render("admin/products", {
      products,
      count
    });
  });
});

/*
 * GET add product
 */
router.get("/add-product", (req, res) => {
  const title = "";
  const desc = "";
  const price = "";

  Category.find((err, categories) => {
    res.render("admin/add-product", {
      title,
      desc,
      categories,
      price
    });
  });
});

/*
 * POST add product
 */
router.post(
  "/add-product",
  upload.single("image"),
  [
    check("title", "Title must have a value")
      .not()
      .isEmpty(),
    check("desc", "Description must have a value")
      .not()
      .isEmpty(),
    check("price", "Price must have a value").isDecimal()
  ],
  (req, res) => {
    const errors = validationResult(req);

    const title = req.body.title;
    let slug = title.replace(/\s+/g, "-").toLowerCase();
    const desc = req.body.desc;
    const price = req.body.price;
    const category = req.body.category;
    let image = {};
    if (req.file) {
      image.data = fs.readFileSync(req.file.path);
      image.contentType = req.file.mimetype;
    }

    if (!errors.isEmpty()) {
      Category.find((err, categories) => {
        res.render("admin/add-product", {
          errors: errors.array(),
          title,
          desc,
          categories,
          price
        });
      });
    } else {
      Product.findOne({ slug }, (err, product) => {
        if (product) {
          req.flash("danger", "Product title exists, choose another");
          Category.find((err, categories) => {
            res.render("admin/add-product", {
              title,
              desc,
              categories,
              price
            });
          });
        } else {
          const price2db = parseFloat(price).toFixed(2);

          const product = new Product({
            title,
            slug,
            desc,
            category,
            price: price2db,
            image
          });

          product.save(err => {
            if (err) console.log(err);

            req.flash("success", "Product added");
            res.redirect("/admin/products");
          });
        }
      });
    }
  }
);

/*
 * GET edit product
 */
router.get("/edit-product/:id", async (req, res) => {
  let errors = "";

  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  try {
    const prod = await Product.findById(req.params.id);

    Category.find((err, categories) => {
      let { title, desc, category, price, _id, image, gallery } = prod;

      category.replace(/\s+/g, "-").toLowerCase();
      price = parseFloat(price).toFixed(2);

      res.render("admin/edit-product", {
        errors,
        title,
        desc,
        categories,
        category,
        price,
        image,
        gallery,
        id: _id
      });
    });
  } catch (err) {
    console.error(err);
    res.redirect("/admin/products");
  }
});

/*
 * POST edit product
 */
router.post(
  "/edit-product/:id",
  upload.single("image"),
  [
    check("title", "Title must have a value")
      .not()
      .isEmpty(),
    check("desc", "Description must have a value")
      .not()
      .isEmpty(),
    check("price", "Price must have a value").isDecimal()
  ],
  (req, res) => {
    const errors = validationResult(req);

    const title = req.body.title;
    let slug = title.replace(/\s+/g, "-").toLowerCase();
    const desc = req.body.desc;
    const price = req.body.price;
    const category = req.body.category;
    const id = req.params.id;
    const pimage = req.body.pimage;
    let image = {};
    if (req.file) {
      image.data = fs.readFileSync(req.file.path);
      image.contentType = req.file.mimetype;
    }

    if (!errors.isEmpty()) {
      req.session.errors = errors.array();
      res.redirect("/admin/products/edit-product/" + id);
    } else {
      Product.findOne({ slug, _id: { $ne: id } }, (err, product) => {
        if (err) console.log(err);
        if (product) {
          req.flash("danger", "Product title exists, choose another");
          Category.find((err, categories) => {
            res.redirect("/admin/products/edit-product/" + id);
          });
        } else {
          Product.findById(id, (err, prod) => {
            if (err) console.log(err);

            const price2db = parseFloat(price).toFixed(2);

            prod.title = title;
            prod.slug = slug;
            prod.desc = desc;
            prod.price = price2db;
            prod.category = category;
            if (req.file) prod.image = image;

            prod.save(err => {
              if (err) console.log(err);

              req.flash("success", "Product updated");
              res.redirect("/admin/products");
            });
          });
        }
      });
    }
  }
);

/*
 * POST product gallery
 */
router.post("/product-gallery/:id", upload.array("file"), async (req, res) => {
  const productImages = req.files;
  const id = req.params.id;
  const gallery = {};
  try {
    const prod = await Product.findById(id);
    productImages.forEach(image => {
      gallery.data = fs.readFileSync(image.path);
      gallery.contentType = image.mimetype;
    });
    prod.gallery.push(gallery);
    await prod.save();

    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/*
 * GET delete product
 */
router.get("/delete-product/:id", (req, res) => {
  const id = req.params.id;

  Product.findById(id, async (err, prod) => {
    if (err) console.log(err);

    await prod.remove();

    req.flash("success", "product deleted!");
    res.redirect("/admin/products");
  });
});

/*
 * GET delete image
 */
router.get("/delete-image/:productId/:imageId", (req, res) => {
  Product.findById(req.params.productId, async (err, prod) => {
    if (err) return res.status(404).json({ msg: "product does not exist" });

    const removeIndex = prod.gallery
      .map(image => image._id)
      .indexOf(req.params.imageId);

    prod.gallery.splice(removeIndex, 1);

    await prod.save();

    req.flash("success", "Image deleted!");
    res.redirect("/admin/products/edit-product/" + req.params.productId);
  });
});

// Exports
module.exports = router;

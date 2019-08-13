const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

// Get Category model
const Category = require("../models/category");

/*
 * GET Category index
 */
router.get("/", (req, res) => {
  Category.find((err, categories) => {
    if (err) console.log(err);

    res.render("admin/categories", {
      categories
    });
  });
});

/*
 * GET add category page
 */
router.get("/add-category", (req, res) => {
  const title = "";

  res.render("admin/add-category", {
    title
  });
});

/*
 * POST add category
 */
router.post(
  "/add-category",
  [
    check("title", "Title must have a value")
      .not()
      .isEmpty()
  ],
  (req, res) => {
    const errors = validationResult(req);

    const title = req.body.title;
    let slug = title.replace(/\s+/g, "-").toLowerCase();

    if (!errors.isEmpty()) {
      res.render("admin/add-category", {
        errors: errors.array(),
        title
      });
    } else {
      Category.findOne({ slug }, (error, category) => {
        if (category) {
          req.flash("danger", "Category title exists, choose another");
          res.render("admin/add-category", {
            errors: errors.array(),
            title
          });
        } else {
          const category = new Category({
            title,
            slug
          });
          category.save(err => {
            if (err) return console.log(err);

            Category.find({}).exec((err, categories) => {
              if (err) console.log(err);

              req.app.locals.categories = categories;
            });

            req.flash("success", "Category added");
            res.redirect("/admin/categories");
          });
        }
      });
    }
  }
);

/*
 * GET edit Category page
 */
router.get("/edit-category/:id", (req, res) => {
  Category.findById(req.params.id, (err, category) => {
    if (err) console.log(err);

    const { title, _id } = category;

    res.render("admin/edit-category", {
      title,
      id: _id
    });
  });
});

/*
 * POST edit category
 */
router.post(
  "/edit-category/:id",
  [
    check("title", "Title must have a value")
      .not()
      .isEmpty()
  ],
  (req, res) => {
    const errors = validationResult(req);

    const title = req.body.title;
    let slug = title.replace(/\s+/g, "-").toLowerCase();
    const id = req.params.id;

    if (!errors.isEmpty()) {
      res.render("admin/edit-category", {
        errors: errors.array(),
        title,
        id
      });
    } else {
      Category.findOne({ slug, _id: { $ne: id } }, (error, category) => {
        if (category) {
          req.flash("danger", "Category title exists, choose another");
          res.render("admin/edit-category", {
            errors: errors.array(),
            title,
            id
          });
        } else {
          Category.findById(id, (err, category) => {
            if (err) console.log(err);

            category.title = title;
            category.slug = slug;

            category.save(err => {
              if (err) return console.log(err);

              Category.find({}).exec((err, categories) => {
                if (err) console.log(err);

                req.app.locals.categories = categories;
              });

              req.flash("success", "Category updated!");
              res.redirect("/admin/categories/edit-category/" + id);
            });
          });
        }
      });
    }
  }
);

/*
 * GET delete category
 */
router.get("/delete-category/:id", (req, res) => {
  Category.findByIdAndRemove(req.params.id, err => {
    if (err) console.log(err);

    Category.find({}).exec((err, categories) => {
      if (err) console.log(err);

      req.app.locals.categories = categories;
    });

    req.flash("success", "Category deleted!");
    res.redirect("/admin/categories");
  });
});

// Exports
module.exports = router;

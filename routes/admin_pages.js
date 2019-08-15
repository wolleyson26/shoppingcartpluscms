const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

// Get Page model
const Page = require("../models/page");

// Auth middleware
const { isAdmin } = require("../config/auth");

/*
 * GET pages index
 */
router.get("/", isAdmin, (req, res) => {
  Page.find({})
    .sort({ sorting: 1 })
    .exec((err, pages) => {
      res.render("admin/pages", {
        pages
      });
    });
});

/*
 * GET add page
 */
router.get("/add-page", isAdmin, (req, res) => {
  const title = "";
  const slug = "";
  const content = "";

  res.render("admin/add-page", {
    title,
    slug,
    content
  });
});

/*
 * POST add page
 */
router.post(
  "/add-page",
  [
    check("title", "Title must have a value")
      .not()
      .isEmpty(),
    check("content", "Content must have a value")
      .not()
      .isEmpty()
  ],
  (req, res) => {
    const errors = validationResult(req);

    const title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, "-").toLowerCase();
    const content = req.body.content;

    if (!errors.isEmpty()) {
      res.render("admin/add-page", {
        errors: errors.array(),
        title,
        slug,
        content
      });
    } else {
      Page.findOne({ slug }, (error, page) => {
        if (page) {
          req.flash("danger", "Page slug exists, choose another");
          res.render("admin/add-page", {
            errors: errors.array(),
            title,
            slug,
            content
          });
        } else {
          const page = new Page({
            title,
            slug,
            content,
            sorting: 100
          });

          page.save(err => {
            if (err) return console.log(err);

            Page.find({})
              .sort({ sorting: 1 })
              .exec((err, pages) => {
                if (err) console.log(err);

                req.app.locals.pages = pages;
              });

            req.flash("success", "Page added");
            res.redirect("/admin/pages");
          });
        }
      });
    }
  }
);

// Sort pages function
function sortPages(ids, callback) {
  let count = 0;

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    count++;

    (count => {
      Page.findById(id, (err, page) => {
        page.sorting = count;
        page.save(err => {
          if (err) console.log(err);

          ++count;
          if (count >= ids.length) {
            callback();
          }
        });
      });
    })(count);
  }
}

/*
 * POST reorder pages
 */
router.post("/reorder-pages", (req, res) => {
  let ids = req.body["id[]"];

  sortPages(ids, () => {
    Page.find({})
      .sort({ sorting: 1 })
      .exec((err, pages) => {
        if (err) console.log(err);

        req.app.locals.pages = pages;
      });
  });
});

/*
 * GET edit page
 */
router.get("/edit-page/:id", isAdmin, (req, res) => {
  Page.findById(req.params.id, (err, page) => {
    if (err) console.log(err);

    const { title, slug, content, _id } = page;

    res.render("admin/edit-page", {
      title,
      slug,
      content,
      id: _id
    });
  });
});

/*
 * POST edit page
 */
router.post(
  "/edit-page/:id",

  [
    check("title", "Title must have a value")
      .not()
      .isEmpty(),
    check("content", "Content must have a value")
      .not()
      .isEmpty()
  ],
  (req, res) => {
    const errors = validationResult(req);

    const title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, "-").toLowerCase();
    const content = req.body.content;
    const id = req.params.id;

    if (!errors.isEmpty()) {
      res.render("admin/edit-page", {
        errors: errors.array(),
        title,
        slug,
        content,
        id
      });
    } else {
      Page.findOne({ slug, _id: { $ne: id } }, (error, page) => {
        if (page) {
          req.flash("danger", "Page slug exists, choose another");
          res.render("admin/edit-page", {
            errors: errors.array(),
            title,
            slug,
            content,
            id
          });
        } else {
          Page.findById(id, (err, page) => {
            if (err) console.log(err);

            page.title = title;
            page.slug = slug;
            page.content = content;

            page.save(err => {
              if (err) return console.log(err);

              Page.find({})
                .sort({ sorting: 1 })
                .exec((err, pages) => {
                  if (err) console.log(err);

                  req.app.locals.pages = pages;
                });

              req.flash("success", "Page updated!");
              res.redirect("/admin/pages/edit-page/" + page.id);
            });
          });
        }
      });
    }
  }
);

/*
 * GET delete page
 */
router.get("/delete-page/:id", isAdmin, (req, res) => {
  Page.findByIdAndRemove(req.params.id, err => {
    if (err) console.log(err);

    Page.find({})
      .sort({ sorting: 1 })
      .exec((err, pages) => {
        if (err) console.log(err);

        req.app.locals.pages = pages;
      });

    req.flash("success", "Page deleted!");
    res.redirect("/admin/pages/");
  });
});

// Exports
module.exports = router;

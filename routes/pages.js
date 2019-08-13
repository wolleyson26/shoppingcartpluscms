const express = require("express");
const router = express.Router();

// Get page model
const Page = require("../models/page");

/*
 * GET /
 */
router.get("/", (req, res) => {
  Page.findOne({ slug: "home" }, (err, page) => {
    if (err) console.log(err);

    const { title, content } = page;

    res.render("index", { title, content });
  });
});

/*
 * GET a page
 */
router.get("/:slug", (req, res) => {
  const slug = req.params.slug;

  Page.findOne({ slug }, (err, page) => {
    if (err) console.log(err);

    if (!page) {
      res.redirect("/");
    } else {
      const { title, content } = page;

      res.render("index", { title, content });
    }
  });
});

// Exports
module.exports = router;

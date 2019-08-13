const mongoose = require("mongoose");

// Product Schema
const ProductSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String
  },
  desc: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    data: Buffer,
    contentType: String
  },
  gallery: [
    {
      data: Buffer,
      contentType: String
    }
  ]
});

const Product = (module.exports = mongoose.model("Product", ProductSchema));

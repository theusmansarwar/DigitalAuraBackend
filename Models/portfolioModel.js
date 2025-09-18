const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    url: { type: String }, 
    files: [{ type: String }], 
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Portfolio = mongoose.model("Portfolio", PortfolioSchema);
module.exports = Portfolio;

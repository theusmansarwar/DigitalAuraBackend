const express = require("express");
const router = express.Router();

const {
  addPortfolio,
  updatePortfolio,
  deletePortfolio,
  deleteAllPortfolios,
} = require("../Controller/portfolioController");

const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add", authMiddleware, addPortfolio);
router.put("/update/:id", authMiddleware, updatePortfolio);
router.delete("/delete/:id", authMiddleware, deletePortfolio);
router.delete("/delete-many", authMiddleware, deleteAllPortfolios);


module.exports = router;

const express = require("express");
const router = express.Router();

const {
 addFAQ, updateFAQ, deleteFAQ, deleteAllFAQs
} = require("../Controller/faqsController");

const authMiddleware = require("../Middleware/authMiddleware");
router.post("/add", addFAQ);
router.put("/update/:id", authMiddleware, updateFAQ);
router.delete("delete/:id", authMiddleware, deleteFAQ);
router.delete("/delete", authMiddleware, deleteAllFAQs);



module.exports = router;

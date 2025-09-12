const express = require("express");
const router = express.Router();

const { addEmail } = require("../Controller/newsletterController");




router.post('/add', addEmail);

module.exports = router;
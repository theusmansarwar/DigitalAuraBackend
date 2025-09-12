const express = require("express");
const router = express.Router();

const { CreateApplication, ApplicationList, GetApplicationById, DeleteApplication } = require("../Controller/applicationsController");
const authMiddleware = require("../Middleware/authMiddleware");



router.post('/CreateApplication', CreateApplication);
router.get('/ApplicationList',authMiddleware,ApplicationList );
router.delete('/ApplicationDelete',authMiddleware,DeleteApplication );
router.get('/Application/:id',authMiddleware,GetApplicationById );

module.exports = router;
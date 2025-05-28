const express = require("express");
const router = express.Router();

const { AddMessage } = require("./MessagesController.js");

router.post("/Add/:reciverId", AddMessage);

module.exports = router;
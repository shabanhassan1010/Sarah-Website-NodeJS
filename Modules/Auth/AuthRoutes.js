const express = require("express");
const router = express.Router();

const { signUp , signIn, confirmEmail , refreshToken , sendCode , forgetPassword } = require("./AuthController.js");

router.post("/signUp" , signUp);
router.post("/signIn" , signIn);
router.get("/confirmEmail/:token" , confirmEmail);
router.get("/refreshToken/:token" , refreshToken);
router.post("/sendCode" , sendCode);
router.post("/forgetPassword" , forgetPassword);

module.exports = router;
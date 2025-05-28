const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../../Middleware/middleware.js"); // Correct import path

const { GetAllUsers,  AddUser , UpdateUser ,  DeleteUser , 
        GetUserById , GetUser , GetMessages , UpdatePassword} = require("./UserController.js");

router.get("/getAll", GetAllUsers);
router.post("/Add", AddUser);
router.put("/Update/:id", UpdateUser);
router.delete("/Delete/:id", DeleteUser);
router.get("/GetById/:id", GetUserById);
router.get("/GetUser", AuthMiddleware() , GetUser);
router.get("/GetMessages" , AuthMiddleware() , GetMessages);
router.patch("/UpdatePassword" , AuthMiddleware() , UpdatePassword);


module.exports = router;
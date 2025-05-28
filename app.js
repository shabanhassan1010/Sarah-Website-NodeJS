  const dotenv = require("dotenv");
  dotenv.config()
  const express = require("express");
  const { connectDB } = require("./DBContext/Context.js");
  const server = express();

  
  // Database connection
  connectDB().then(() => {


    // Middleware
  server.use(express.json()); 



    // Routes
  const UserRouter = require("./Modules/User/UserRouter.js");
  const AuthRouter = require("./Modules/Auth/AuthRoutes.js");
  const MessagesRouter = require("./Modules/Messages/MessagesRouter.js");



    // Controllers
  server.use("/users", UserRouter);
  server.use("/auth", AuthRouter);
  server.use("/Messages", MessagesRouter);
  // server.get("*" , (req, res) =>{
  //   res.json({Message : "Invalid Api"})
  // })
  

  // Error handling
  server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });


  
  // Start server
  server.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
  });
  }).catch(error => {
  console.error("❌ Failed to start application:", error);
});
const UserRouter = require("./User/UserRouter.js");
const authRouter = require("./Auth/AuthRoutes.js");
const MessagesRouter = require("../Modules/Messages/MessagesRouter.js");

module.exports = {
  UserRouter,
  authRouter,
  MessagesRouter
};

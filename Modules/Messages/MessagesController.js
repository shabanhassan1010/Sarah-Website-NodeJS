const MessageModel = require("../../DBContext/Models/MessagesModel.js");
const userModel = require("../../DBContext/Models/UserModel.js")

const AddMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { reciverId } = req.params;

    if (!text || !reciverId) {
      return res.status(400).json({  success: false, error: "Message and receiverId are required"  });
    }

    const findUser = await userModel.findById(reciverId);
    if (!findUser) {
      return res.status(404).json({  success: false, message: "Receiver ID is not correct"  });
    }

    const newMessage = new MessageModel({ text,  reciverId });

    const savedMessage = await newMessage.save();
    return res.status(201).json({ message: "Message created successfully",
      data: { _id: savedMessage._id, text: savedMessage.text}
    });

  } catch (error) {
    return res.status(500).json({ error: "User With This is wrong"  });
  }
};

module.exports = { AddMessage };
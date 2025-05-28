const User = require("../../DBContext/Models/UserModel.js")
const messageModel = require("../../DBContext/Models/MessagesModel.js");
const userModel = require("../../DBContext/Models/UserModel.js");
const bcrypt = require('bcryptjs');


const GetAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Server Error: " + error.message });
  }
};

const GetUserById = async (req , res) =>{
  const {id} = req.params;
  const findUser = await User.findById(id);
  if(findUser){
    res.status(200).json({Message:"This user Is Exist",  findUser})
  }
    res.status(404).json({Message:"This user Is not Exist"})
  
}

const GetUser = async (req , res) =>{
    try{
    if (!req.user) {    // dh el user which is exist in middleware -> req.user = user;
      return res.status(404).json({ Message: "User not found" });
    }
    
    res.status(200).json({
      Message: "User is found",
      user: { id: req.user._id, username: req.user.userName, email: req.user.email , 
        gender : req.user.gender , isConfirmed : req.user.isConfirmed 
      }
    });
    
    } catch (error) {
      console.error("GetUser error:", error);
      res.status(500).json({ Message: "Server error" });
    }
}

const AddUser = async (req, res) => {
  try {
    const { firstName, lastName, userName, email, password, gender } = req.body;

    if (!firstName || !lastName || !userName || !email || !password) {
      return res.status(400).json({
        success: false,error: "All fields (firstName, lastName, userName, email, password) are required",});
    }

    // Check for existing user by both email and username
    const existingUser = await User.findOne({$or: [{ email }, { userName }]});

    if (existingUser) {
      const conflictField = existingUser.email === email ? "email" : "userName";
      return res.status(409).json({ success: false, error: `User with this ${conflictField} already exists`,});
    }

    const newUser = new User({firstName, lastName, userName, email, password, gender: gender || "male"});

    const savedUser = await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { _id: savedUser._id,  firstName: savedUser.firstName, lastName: savedUser.lastName,
        userName: savedUser.userName, email: savedUser.email, 
        gender: savedUser.gender ,    createdAt: savedUser.createdAt },
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal server error", details: error.message, });
  }
};

const UpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;  // hna ana a5td all feilds

    const updatedUser = await User.findByIdAndUpdate( id, updates,{ new: true, runValidators: true }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: updatedUser 
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const DeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID parameter is required", success: false });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found", success: false });
    }

    return res.status(200).json({Message:"User Deleted Successfully" ,success: true, data: deletedUser });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const GetMessages = async (req, res) => {
  try {
    const messages = await messageModel.find({reciverId: req.user.id});

    res.status(200).json({ count: messages.length, data: messages });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Server Error: " + error.message });
  }
};

const UpdatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // 1. Validate password confirmation
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: "New password and confirmation do not match" });
    }

    // 2. Find user with password field (since it's select: false)
    const user = await userModel.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 3. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({success: false, message: "Current password is incorrect"});
    }

    // 4. Hash new password properly
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(newPassword, saltRounds);

    // 5. Update password and track change time
    const updatedUser = await userModel.findByIdAndUpdate(user._id, { password: hashPassword, passwordChangedAt: Date.now()},
      { new: true }
    ).select('-password'); // Exclude password from response

    return res.status(200).json({ success: true, message: "Password updated successfully", data: updatedUser});

  } catch (error) {
    return res.status(500).json({ success: false,  message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { GetAllUsers, AddUser, UpdateUser, DeleteUser  , GetUserById , GetUser , GetMessages , UpdatePassword };

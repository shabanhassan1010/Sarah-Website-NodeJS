const UserModel = require("../../DBContext/Models/UserModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodeoutlook = require('nodejs-nodemailer-outlook');
const userModel = require("../../DBContext/Models/UserModel.js");


const sendEmail = (dest, message) => {
  nodeoutlook.sendEmail({
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    from: process.env.EMAIL_USER,
    to: dest,
    subject: 'Email Verification Required',
    html: message,
    onError: (e) => console.error('Email Error:', e),
    onSuccess: (i) => console.log('Email Sent:', i)
  });
};

const signUp = async (req, res) => {
  try {
    const { userName, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({  success: false, message: "Password and confirmation do not match"  });
    }

    const existingUser = await UserModel.findOne({ $or: [{ email }, { userName }] });

    if (existingUser) {
      return res.status(409).json({ success: false,  message: "User with this email or username already Register " });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ userName, email ,password: hashedPassword });
    const savedUser = await newUser.save();

    // Generate verification token with user ID
    const token = jwt.sign( { id: newUser._id }, process.env.JWT_SECRET,{ expiresIn: '1h' } );
    const refreshToken = jwt.sign( { id: newUser._id }, process.env.JWT_SECRET,{ expiresIn: 60* 60 } );

    const host = req.get('host');
    let URL = `${req.protocol}://${host}`

    const verificationLink = 
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Email Verification Required</h2>
        <p>Please click the button below to verify your email address:</p>
        <a href="http://localhost:3000/auth/confirmEmail/${token}" 
          style="display: inline-block; padding: 12px 24px; 
                background-color: #2563eb; color: white; 
                text-decoration: none; border-radius: 4px;
                margin: 10px 0;">
          Verify Email
        </a>

        <p style="margin-top: 30px; color: #6b7280;">
          If you need a new verification link, click below:<br>
          <a href="http://localhost:3000/auth/refreshToken/${refreshToken}" 
            style="color: #2563eb; text-decoration: underline;">
            Request New Verification Email
          </a>
        </p>
      </div>
    `;
    sendEmail(email, verificationLink);

    return res.status(201).json({ success: true, message: "Account created. Verification email sent.",
      data: { id: savedUser._id, userName: savedUser.userName, email: savedUser.email , token}
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error during registration"
    });
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({  success: false, message: "Both email and password are required" });
    }

    const user = await UserModel.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ success: false,message: "Invalid Email" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false,  message: "Invalid Password" });
    }

    if (!user.isConfirmed) {
      return res.status(403).json({ success: false,message: "Please confirm your email first"});
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET,  { expiresIn: '1h' }
    );

    return res.status(200).json({ success: true, message: "Login successful",
      user: { id: user._id, userName: user.userName, email: user.email, gender: user.gender, coverPics: user.coverPics},
      token
    });

  } catch (error) {
    return res.status(500).json({success: false,message: "Internal server error" });
  }
};

const confirmEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findOne({_id: decoded.id, isConfirmed: false });

    if (!user) {
      return res.status(400).json({success: false,message: "Invalid or expired verification token"});
    }

    user.isConfirmed = true;
    await user.save();

    return res.status(200).json({success: true,message: "Email verified successfully" });

  } catch (error) {
    return res.status(500).json({success: false,message: "Internal server error" });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(!decoded || !decoded.id)
    {
      return res.status(400).json({success: false,message: "Invalid token or Id "});
    }
    else
    {
        const user = await UserModel.findById(decoded.id);
        if (!user) 
        {
        return res.status(400).json({success: false,message: "this User did not register please register first"});
        }
        else
        {
          if(user.isConfirmed){
            return res.status(200).json({success: true,message: "Email Already Confirmed" });
          }else{
            const token = jwt.sign( { id: user._id }, process.env.JWT_SECRET ); // new i will create token but with not expire date  
            const verificationLink = 
            ` 
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Email Verification Required</h2>
            <p>Please click the button below to verify your email address:</p>
            <a href="http://localhost:3000/auth/confirmEmail/${token}"  style="display: inline-block; padding: 12px 24px;
              background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0;">
              Verify Email
            </a> 
            `;
            sendEmail(user.email, verificationLink);  
            return res.status(200).json({success: true,message: "Done Please Check Your Mail" });
          }
        }
    }  

  } catch (error) {
    return res.status(500).json({success: false,message: "Internal server error" });
  }
};

const sendCode = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await userModel.findOne({email}).select('+code');

    if(!user)
    {
      return res.status(400).json({success: false,message: "this email is not register please register first" });
    }
    else
    {
      let otpCode = Math.floor(Math.random() * (1990 - 1000 + 1) + 1000)

      await userModel.findByIdAndUpdate(user._id , { code : otpCode  })
      let message = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2> Your Verification Code </h2>
          <p style="font-size: 18px; margin: 20px 0;"> Code: <strong style="color: #2563eb;">${otpCode}</strong> </p>
          <p style="color: #6b7280;">  This code will expire in 10 minutes  </p>
        </div>   `;
      sendEmail(user.email , message);
      return res.status(200).json({success: true,message: "Done Please Check Your Mail" });
    }

  } catch (error) {
    return res.status(500).json({success: false,message: "Internal server error" });
  }
};

const forgetPassword = async (req, res) => {
  try {
    if (!req.body) 
    {
      return res.status(400).json({ success: false, message: "Request body is missing" });
    }
    const { email , code , password } = req.body;

    if (!email || !code || !password) 
    {
      return res.status(400).json({ success: false, message: "Email, code, and password are required" });
    }
    if(code)
    {
        let user = await userModel.findOne({email , code  })
        if(!user)
        {
          return res.status(400).json({success: false,message: "Email or code is not valid" });
        }
        else
        {
          let hashPassword = await bcrypt.hash(password , 10);
          let updatePass = await userModel.findByIdAndUpdate(user._id, 
            { password : hashPassword , code : null , isConfirmed: true } , {new : true})

          return res.status(200).json({success: true,message: "Password Update Successfully" } , updatePass);
        }
    }
    else{
      return res.status(400).json({success: false ,message: "Invalid Code " } );
    }
   

  } catch (error) {
    console.error("Password Reset Error:", error);
    return res.status(500).json({success: false,message: "Internal server error" });
  }
};
module.exports = { signUp, signIn, confirmEmail , refreshToken , sendCode , forgetPassword};

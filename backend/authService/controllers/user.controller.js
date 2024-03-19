/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Authentication:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the user
 *         name:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *        phoneNo:
 *           type: string
 *           description: The phoneNo of the user
 *        userType:
 *           type: string
 *           description: The userType of the user
 *        programId:
 *           type: string
 *           description: The programId of the user
 *        batchId:
 *           type: string
 *           description: The batchId of the user
 *        accountStatus:
 *           type: string
 *           description: The accountStatus to be selected from active/onhold
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the domain was created
 */

const User = require("../models/user.model").User;
const Auth = require("../models/authentication.model").Auth;
const Authlog = require("../models/authlog.model").Authlog;
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");

const JWT = require("../utils/jwtToken");

AWS.config.update({
  accessKeyId: process.env.AWS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const ses = new AWS.SES({ region: process.env.AWS_REGION });

const sendOtpEmail = async (to, otp) => {
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Text: {
          Data: `Your OTP is: ${otp}`,
        },
      },
      Subject: {
        Data: "OTP Verification",
      },
    },
    Source: "noreply@prashantdey.in",
  };

  try {
    await ses.sendEmail(params).promise();
    console.log(`OTP email sent successfully to ${to}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

/**
 * @openapi
 * /user:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: Email is already registered
 *       '500':
 *         description: Internal Server Error
 */

const registerUser = async (req, res) => {
  try {
    const { name, email, phoneNo, programId, batchId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const newUser = new User({
      name,
      email,
      phoneNo,
      programId,
      batchId,
    });

    await newUser.save();

    const newAuth = new Auth({
      userId: newUser._id,
      otp: Math.floor(100000 + Math.random() * 900000),
      isVerified: false,
      attempt: 0,
    });

    await newAuth.save();

    const newAuthlog = new Authlog({
      userId: newUser._id,
      ip: req.ip,
      status: true,
    });

    await newAuthlog.save();
    await sendOtpEmail(newUser.email, newAuth.otp);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @openapi
 * /user/verify:
 *   post:
 *     summary: Verify OTP and activate the user account
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                  type: number
 *     responses:
 *       '200':
 *         description: OTP verified successfully. Account activated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Authentication'
 *       '401':
 *         description: Invalid OTP or OTP already verified
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal Server Error
 */

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const formattedOTP = parseInt(otp.join(""));
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const auth = await Auth.findOne({ userId: user._id });
    
    if (auth && auth.otp === formattedOTP && !auth.isVerified) {
      user.accountStatus = "active";
      auth.isVerified = true;
      await user.save();
      await auth.save();
      token = JWT.generateToken(user._id, user.userType);
      res.cookie("token", token, { httpOnly: true, secure: true });
      return res.status(200).json({
        message: "OTP verified successfully.",
        jwtToken: token,
      });
    } else {
      return res
        .status(401)
        .json({ message: "Invalid OTP or OTP already verified" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateAuthlog = async (userId, ip, status) => {
  const newAuthlog = new Authlog({
    userId,
    ip,
    status,
  });

  await newAuthlog.save();
};

/**
 * @openapi
 * /user/login:
 *   post:
 *     summary: Request an OTP for login
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       '200':
 *         description: OTP Sent. Verify OTP. Login Again.
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal Server Error
 */
const loginUser = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let tmpOtp = Math.floor(100000 + Math.random() * 900000);

    const updatedAuth = await Auth.findOneAndUpdate(
      { userId: user._id },
      {
        otp: tmpOtp,
        isVerified: false,
      }
    );

    await updateAuthlog(user._id, req.ip, true);
    await sendOtpEmail(user.email, tmpOtp);

    return res
      .status(200)
      .json({ message: "OTP Sent. Verify OTP. Login Again." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @openapi
 * /user:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Authentication
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Authentication'
 *       '500':
 *         description: Internal Server Error
 */

const getAllUser = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @openapi
 * /user/{id}:
 *   get:
 *     summary: Get user data by ID
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Authentication'
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal Server Error
 */

const getUserDataById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @openapi
 * /user/{id}:
 *   put:
 *     summary: Update user data by ID
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Authentication'
 *     responses:
 *       '200':
 *         description: User data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Authentication'
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal Server Error
 */

const updateUserData = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phoneNo, programId, batchId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phoneNo = phoneNo || user.phoneNo;
    user.programId = programId || user.programId;
    user.batchId = batchId || user.batchId;

    await user.save();

    res.status(200).json({ message: "User data updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @openapi
 * /user/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User deleted successfully
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal Server Error
 */

const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.remove();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  registerUser,
  verifyOTP,
  loginUser,
  getAllUser,
  getUserDataById,
  updateUserData,
  deleteUserById,
};

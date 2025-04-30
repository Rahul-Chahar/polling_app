const userService = require("../services/userService");
const asyncHandler = require("express-async-handler");


const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await userService.registerUser(username, email, password);
    res.status(201).json(user);
  } catch (error) {
    res.status(400);
    throw new Error(error.message || "User registration failed");
  }
});


const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userService.loginUser(email, password);
    res.json(user);
  } catch (error) {
    res.status(401); 
    throw new Error(error.message || "Login failed");
  }
});


const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const userProfile = await userService.getUserProfile(req.user._id);
    res.json(userProfile);
  } catch (error) {
    res.status(404);
    throw new Error(error.message || "User profile not found");
  }
});


const updateUserProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload a file");
  }

  try {
    
    const filePath = `/uploads/${req.file.filename}`;
    const updatedUser = await userService.updateUserProfilePicture(req.user._id, filePath);
    res.json(updatedUser);
  } catch (error) {
    res.status(400);
    throw new Error(error.message || "Failed to update profile picture");
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfilePicture,
};

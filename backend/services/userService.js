const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const registerUser = async (username, email, password) => {
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new Error("User already exists");
  }

  const user = await User.create({
    username,
    email,
    password, 
  });

  if (user) {
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    };
  } else {
    throw new Error("Invalid user data");
  }
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");

  if (user && (await user.matchPassword(password))) {
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    };
  } else {
    throw new Error("Invalid email or password");
  }
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId)
    .select("-password")
    .populate("createdPolls", "_id question") 
    .populate({
        path: "votedPolls",
        select: "poll option", 
        populate: { 
            path: "poll", 
            select: "_id question" 
        }
    });

  if (user) {
    return user;
  } else {
    throw new Error("User not found");
  }
};

const updateUserProfilePicture = async (userId, filePath) => {
  const user = await User.findById(userId);

  if (user) {
    user.profilePicture = filePath; 
    const updatedUser = await user.save();
    return {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
        token: generateToken(updatedUser._id), 
    };
  } else {
    throw new Error("User not found");
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfilePicture,
};

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
    select: false, 
  },
  profilePicture: {
    type: String,
    default: "/uploads/default_avatar.png",
  },
  createdPolls: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
    },
  ],
  votedPolls: [
    {
      poll: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Poll",
      },
      option: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
  ],
}, { timestamps: true });

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); 
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);


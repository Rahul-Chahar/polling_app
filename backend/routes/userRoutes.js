const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfilePicture,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", protect, getUserProfile);

router.post("/profile/picture", protect, (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            res.status(400);
            return next(new Error(err.message || "File upload error"));
        }
        updateUserProfilePicture(req, res, next);
    });
});

module.exports = router;

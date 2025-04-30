const express = require("express");
const router = express.Router({ mergeParams: true }); 
const {
  addCommentToPoll, 
  getCommentsForPoll,
  addReplyToComment,
} = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .post(protect, addCommentToPoll)       
  .get(getCommentsForPoll);        


router.post("/reply/:commentId", protect, addReplyToComment);

module.exports = router;

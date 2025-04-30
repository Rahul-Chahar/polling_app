const express = require("express");
const router = express.Router();
const {
  createPoll,
  getAllPolls,
  getPollById,
  voteOnPoll,
} = require("../controllers/pollController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getAllPolls);
router.get("/:id", getPollById);

router.post("/", protect, createPoll);
router.post("/:id/vote", protect, voteOnPoll);

module.exports = router;

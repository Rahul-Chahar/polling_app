const commentService = require("../services/commentService");
const asyncHandler = require("express-async-handler");


const addCommentToPoll = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const pollId = req.params.pollId;
  const userId = req.user._id;

  if (!text) {
    res.status(400);
    throw new Error("Comment text is required");
  }

  try {
    const comment = await commentService.addCommentToPoll(pollId, text, userId);
    
    const io = req.app.get("socketio");
    io.to(pollId).emit("comment_added", comment);
    console.log(`Emitted comment_added for poll ${pollId}`);

    res.status(201).json(comment);
  } catch (error) {
    res.status(400);
    throw new Error(error.message || "Failed to add comment");
  }
});


const addReplyToComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const parentCommentId = req.params.commentId;
  const userId = req.user._id; 

  if (!text) {
    res.status(400);
    throw new Error("Reply text is required");
  }

  try {
    const reply = await commentService.addReplyToComment(parentCommentId, text, userId);
    
    const io = req.app.get("socketio");
    const pollId = reply.poll.toString(); 
    io.to(pollId).emit("comment_added", reply); 
    console.log(`Emitted comment_added (reply) for poll ${pollId}`);

    res.status(201).json(reply);
  } catch (error) {
    res.status(400);
    throw new Error(error.message || "Failed to add reply");
  }
});


const getCommentsForPoll = asyncHandler(async (req, res) => {
  const pollId = req.params.pollId;

  try {
    const comments = await commentService.getCommentsForPoll(pollId);
    res.json(comments);
  } catch (error) {
    res.status(404); 
    throw new Error(error.message || "Failed to fetch comments");
  }
});

module.exports = {
  addCommentToPoll,
  addReplyToComment,
  getCommentsForPoll,
};

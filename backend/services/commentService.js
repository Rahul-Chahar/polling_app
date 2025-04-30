const Comment = require("../models/Comment");
const Poll = require("../models/Poll");

const addCommentToPoll = async (pollId, text, userId) => {
  const poll = await Poll.findById(pollId);
  if (!poll) {
    throw new Error("Poll not found");
  }

  const comment = new Comment({
    text,
    user: userId,
    poll: pollId,
  });

  const createdComment = await comment.save();
  const populatedComment = await Comment.findById(createdComment._id).populate("user", "username profilePicture");
  return populatedComment;
};

const addReplyToComment = async (parentCommentId, text, userId) => {
  const parentComment = await Comment.findById(parentCommentId);
  if (!parentComment) {
    throw new Error("Parent comment not found");
  }
  if (parentComment.parentComment) {
    throw new Error("Cannot reply to a reply"); 
  }

  const reply = new Comment({
    text,
    user: userId,
    poll: parentComment.poll,
    parentComment: parentCommentId,
  });

  const createdReply = await reply.save();
  const populatedReply = await Comment.findById(createdReply._id).populate("user", "username profilePicture");
  return populatedReply;
};

const getCommentsForPoll = async (pollId) => {
  const comments = await Comment.find({ poll: pollId })
    .populate("user", "username profilePicture") 
    .sort({ createdAt: "asc" }); 
  return comments;
};

module.exports = {
  addCommentToPoll,
  addReplyToComment,
  getCommentsForPoll,
};

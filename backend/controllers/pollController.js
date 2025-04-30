const pollService = require("../services/pollService");
const asyncHandler = require("express-async-handler");

const createPoll = asyncHandler(async (req, res) => {
  const { question, options } = req.body;
  const userId = req.user._id; 

  if (!question || !options || options.length < 2) {
    res.status(400);
    throw new Error("Please provide a question and at least two options");
  }

  try {
    const poll = await pollService.createPoll(question, options, userId);
    res.status(201).json(poll);
  } catch (error) {
    res.status(400);
    throw new Error(error.message || "Failed to create poll");
  }
});


const getAllPolls = asyncHandler(async (req, res) => {
  try {
    const polls = await pollService.getAllPolls();
    res.json(polls);
  } catch (error) {
    res.status(500); 
    throw new Error(error.message || "Failed to fetch polls");
  }
});


const getPollById = asyncHandler(async (req, res) => {
  try {
    const poll = await pollService.getPollById(req.params.id);
    res.json(poll);
  } catch (error) {
    res.status(404); 
    throw new Error(error.message || "Poll not found");
  }
});


const voteOnPoll = asyncHandler(async (req, res) => {
  const { optionId } = req.body;
  const pollId = req.params.id;
  const userId = req.user._id; 

  if (!optionId) {
    res.status(400);
    throw new Error("Option ID is required");
  }

  try {
    const updatedPoll = await pollService.voteOnPoll(pollId, optionId, userId);
    
    
    const io = req.app.get("socketio"); 
    io.to(pollId).emit("poll_updated", updatedPoll);
    console.log(`Emitted poll_updated for poll ${pollId}`);

    res.json(updatedPoll);
  } catch (error) {
    res.status(400);
    throw new Error(error.message || "Failed to vote on poll");
  }
});

module.exports = {
  createPoll,
  getAllPolls,
  getPollById,
  voteOnPoll,
};

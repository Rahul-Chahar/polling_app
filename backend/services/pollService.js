const Poll = require("../models/Poll");
const User = require("../models/User");

const createPoll = async (question, options, userId) => {
  const poll = new Poll({
    question,
    options: options.map(text => ({ text, votes: 0 })),
    createdBy: userId,
  });

  const createdPoll = await poll.save();

  await User.findByIdAndUpdate(userId, { $push: { createdPolls: createdPoll._id } });

  return createdPoll;
};

const getAllPolls = async () => {
  const polls = await Poll.find({}).populate("createdBy", "username").sort({ createdAt: -1 });
  return polls;
};

const getPollById = async (pollId) => {
  const poll = await Poll.findById(pollId).populate("createdBy", "username");
  if (!poll) {
    throw new Error("Poll not found");
  }
  return poll;
};

const voteOnPoll = async (pollId, optionId, userId) => {
  const poll = await Poll.findById(pollId);

  if (!poll) {
    throw new Error("Poll not found");
  }

  const alreadyVoted = poll.voters.some(voter => voter.user.toString() === userId.toString());
  if (alreadyVoted) {
    throw new Error("User has already voted on this poll");
  }

  const option = poll.options.id(optionId);
  if (!option) {
    throw new Error("Option not found");
  }

  option.votes += 1;

  poll.voters.push({ user: userId, option: optionId });


  await User.findByIdAndUpdate(userId, { $addToSet: { votedPolls: { poll: pollId, option: optionId } } });

  const updatedPoll = await poll.save();
  
  const populatedPoll = await Poll.findById(updatedPoll._id).populate("createdBy", "username");

  return populatedPoll;
};

module.exports = {
  createPoll,
  getAllPolls,
  getPollById,
  voteOnPoll,
};

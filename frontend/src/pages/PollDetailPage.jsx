import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import io from 'socket.io-client';
import CommentSection from '../components/CommentSection.jsx';

const PollDetailPage = () => {
  const { id: pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [voteError, setVoteError] = useState('');
  const [isVoting, setIsVoting] = useState(false);
  const { user, API_URL, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);

  const fetchPoll = useCallback(async () => {
    setError('');
    try {
      const { data } = await axios.get(`${API_URL}/polls/${pollId}`);
      setPoll(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch poll details.');
      console.error('Fetch poll error:', err);
    }
    setLoading(false);
  }, [API_URL, pollId]);

  useEffect(() => {
    fetchPoll();
  }, [fetchPoll]);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_APP_SOCKET_URL || 'https://polling-app-fme4.onrender.com');
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.emit('join_poll', pollId);
    console.log(`Socket joined poll room: ${pollId}`);

    newSocket.on('poll_updated', (updatedPoll) => {
      console.log('Received poll_updated event:', updatedPoll);
      if (updatedPoll && updatedPoll._id === pollId) {
        setPoll(updatedPoll);
      }
    });

    return () => {
      console.log(`Socket leaving poll room: ${pollId}`);
      newSocket.emit('leave_poll', pollId);
      newSocket.disconnect();
    };
  }, [pollId]);

  const handleVote = async () => {
    if (!selectedOption) {
      setVoteError('Please select an option to vote.');
      return;
    }
    if (!user) {
      setVoteError('You must be logged in to vote.');
      return;
    }

    setVoteError('');
    setIsVoting(true);

    try {
      const config = {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      };
      const body = { optionId: selectedOption };
      await axios.post(`${API_URL}/polls/${pollId}/vote`, body, config);
    } catch (err) {
      setVoteError(err.response?.data?.message || 'Failed to submit vote.');
      console.error('Vote error:', err);
    }
    setIsVoting(false);
  };

  const hasUserVoted = () => {
    if (!user || !poll) return false;
    return poll.voters.some(voter => voter.user === user._id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading poll details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Poll Not Found</h2>
          <p className="text-gray-700">The poll you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
    'bg-yellow-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
         
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{poll.question}</h2>
            <div className="flex flex-wrap items-center text-sm opacity-90">
              <div className="flex items-center mr-6 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Created by: {poll.createdBy?.username || 'Unknown'}</span>
              </div>
              <div className="flex items-center mr-6 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Created on: {new Date(poll.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Total votes: {totalVotes}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              {poll.options.map((option, index) => {
                const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                const colorClass = colors[index % colors.length];
                
                return (
                  <div key={option._id} className="mb-4">
                    <label className="flex items-start cursor-pointer group">
                      <div className="flex items-center mr-3 mt-1">
                        <input
                          type="radio"
                          name="pollOption"
                          value={option._id}
                          onChange={() => setSelectedOption(option._id)}
                          disabled={hasUserVoted() || isVoting}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-gray-900">{option.text}</span>
                          <span className="text-gray-500">{option.votes} votes ({percentage}%)</span>
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-full ${colorClass} rounded-full transition-all duration-500 ease-out`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>

            {voteError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{voteError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-center justify-between">
              {!hasUserVoted() ? (
                <button 
                  onClick={handleVote} 
                  disabled={!selectedOption || isVoting || !user}
                  className={`w-full sm:w-auto px-6 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                    !selectedOption || isVoting || !user
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                  }`}
                >
                  {isVoting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Submit Vote'}
                </button>
              ) : (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 w-full">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">You have already voted on this poll.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {!user && (
                <div className="mt-4 sm:mt-0">
                  <a 
                    href="/login" 
                    onClick={(e) => { e.preventDefault(); navigate('/login'); }}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login to vote
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

       
        <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800">Comments</h3>
          </div>
          <div className="p-6">
            <CommentSection pollId={pollId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollDetailPage;
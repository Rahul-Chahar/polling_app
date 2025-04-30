import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const HomePage = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { API_URL } = useAuth();

  useEffect(() => {
    const fetchPolls = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await axios.get(`${API_URL}/polls`);
        setPolls(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch polls.');
        console.error('Fetch polls error:', err);
      }
      setLoading(false);
    };

    fetchPolls();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-blue-600 animate-pulse">Loading polls...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600 text-lg font-semibold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">Available Polls</h2>

        {polls.length === 0 ? (
          <p className="text-center text-gray-600">
            No polls available yet.{' '}
            <Link to="/create" className="text-indigo-600 underline hover:text-indigo-800">
              Create one?
            </Link>
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {polls.map((poll) => (
              <div
                key={poll._id}
                className="bg-white shadow-md rounded-xl p-6 transition-transform transform hover:scale-105"
              >
                <h3 className="text-xl font-semibold text-indigo-800 mb-2">
                  <Link to={`/poll/${poll._id}`} className="hover:underline">
                    {poll.question}
                  </Link>
                </h3>
                <p className="text-sm text-gray-600">Created by: <span className="font-medium">{poll.createdBy?.username || 'Unknown'}</span></p>
                <p className="text-sm text-gray-600">Options: {poll.options.length}</p>
                <p className="text-sm text-gray-500">Created on: {new Date(poll.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

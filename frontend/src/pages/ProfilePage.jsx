import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user, API_URL, getAuthHeaders, setUser, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const config = { headers: getAuthHeaders() };
        const { data } = await axios.get(`${API_URL}/users/profile`, config);
        setProfileData(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile data.');
        console.error('Fetch profile error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchProfile();
    }

    if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, API_URL, getAuthHeaders, authLoading]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadError(''); 
  };

  const handlePictureUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const config = {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      };
      const { data } = await axios.post(`${API_URL}/users/profile/picture`, formData, config);

      setProfileData(prev => ({ ...prev, profilePicture: data.profilePicture }));
      setUser(prevUser => ({ ...prevUser, profilePicture: data.profilePicture }));
      setFile(null);
      if (document.getElementById('profilePictureInput')) {
        document.getElementById('profilePictureInput').value = null;
      }

    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload profile picture.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  if (loading || authLoading) {
    return <div className="text-center text-gray-600 py-10">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">Error: {error}</div>;
  }

  if (!profileData) {
    return <div className="text-center text-gray-600 py-10">Could not load profile data.</div>;
  }

  const imageBaseUrl = import.meta.env.VITE_APP_API_URL ? import.meta.env.VITE_APP_API_URL.replace('/api', '') : 'http://localhost:3000';
  const profilePicUrl = profileData.profilePicture.startsWith('http')
                          ? profileData.profilePicture
                          : `${imageBaseUrl}${profileData.profilePicture}`;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">User Profile</h2>
      
      <div className="flex items-center space-x-6 mb-6">
        <img
          src={profilePicUrl}
          alt={`${profileData.username}'s profile`}
          className="w-24 h-24 rounded-full object-cover shadow-md"
          onError={(e) => { e.target.onerror = null; e.target.src=`${imageBaseUrl}/uploads/default_avatar.png`; }}
        />
        <div>
          <p className="text-xl font-semibold text-gray-800">{profileData.username}</p>
          <p className="text-sm text-gray-600">{profileData.email}</p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-xl font-medium text-gray-800">Update Profile Picture</h4>
        <form onSubmit={handlePictureUpload} className="mt-4 space-y-4">
          <div>
            <input
              type="file"
              id="profilePictureInput"
              accept="image/png, image/jpeg, image/gif"
              onChange={handleFileChange}
              className="w-full text-gray-800"
            />
            <button
              type="submit"
              disabled={uploading || !file}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Picture'}
            </button>
            {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
          </div>
        </form>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Polls Created</h3>
        {profileData.createdPolls && profileData.createdPolls.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {profileData.createdPolls.map(poll => (
              <li key={poll._id} className="text-gray-700">
                <Link to={`/poll/${poll._id}`} className="hover:text-blue-600">
                  {poll.question}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">You haven't created any polls yet.</p>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-800">Polls Voted On</h3>
        {profileData.votedPolls && profileData.votedPolls.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {profileData.votedPolls.map(vote => (
              <li key={vote._id} className="text-gray-700">
                {vote.poll ? (
                  <Link to={`/poll/${vote.poll._id}`} className="hover:text-blue-600">
                    {vote.poll.question}
                  </Link>
                ) : (
                  <span>Poll information unavailable</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">You haven't voted on any polls yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

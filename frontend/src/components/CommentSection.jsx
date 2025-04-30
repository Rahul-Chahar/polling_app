import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; 
import io from 'socket.io-client';

const Comment = ({ comment, onReply }) => {
  const { user } = useAuth();
  const isReply = comment.parentComment !== null;
  
  return (
    <div style={{ 
      marginLeft: isReply ? '2rem' : '0', 
      marginBottom: '1rem',
      padding: '0.5rem',
      borderLeft: isReply ? '2px solid #ccc' : 'none',
      backgroundColor: isReply ? '#f9f9f9' : 'transparent'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
        <strong>{comment.user?.username || 'Unknown'}</strong>
        <span style={{ marginLeft: '0.5rem', color: '#666', fontSize: '0.8rem' }}>
          {new Date(comment.createdAt).toLocaleString()}
        </span>
      </div>
      <p style={{ margin: '0.5rem 0' }}>{comment.text}</p>
      {user && !isReply && (
        <button 
          onClick={() => onReply(comment._id)} 
          style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', padding: 0, fontSize: '0.9rem' }}
        >
          Reply
        </button>
      )}
    </div>
  );
};

const CommentForm = ({ pollId, parentCommentId, onCommentSubmitted, onCancel }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { API_URL, getAuthHeaders } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const config = {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      };

      let endpoint;
      if (parentCommentId) {
       
        endpoint = `${API_URL}/comments/reply/${parentCommentId}`; 
      } else {
        endpoint = `${API_URL}/polls/${pollId}/comments`;
      }

      await axios.post(endpoint, { text }, config);
      setText(''); 
      if (onCommentSubmitted) onCommentSubmitted();
      if (onCancel && parentCommentId) onCancel(); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit comment.');
      console.error('Comment submission error:', err);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={parentCommentId ? "Write a reply..." : "Write a comment..."}
          rows="3"
          style={{ width: '100%', marginBottom: '0.5rem' }}
          required
        />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : parentCommentId ? 'Reply' : 'Comment'}
        </button>
        {parentCommentId && (
          <button 
            type="button" 
            onClick={onCancel} 
            style={{ marginLeft: '0.5rem' }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

const CommentSection = ({ pollId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); 
  const { user, API_URL } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_URL}/polls/${pollId}/comments`);
        setComments(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch comments.');
        console.error('Fetch comments error:', err);
      }
      setLoading(false);
    };

    fetchComments();
  }, [API_URL, pollId]);

  useEffect(() => {
  
    const newSocket = io(import.meta.env.VITE_APP_SOCKET_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join_poll', pollId);

    newSocket.on('comment_added', (newComment) => {
      console.log('Comment section received comment_added event:', newComment);
      setComments(prevComments => {
        const exists = prevComments.some(c => c._id === newComment._id);
        if (exists) return prevComments;
        return [...prevComments, newComment];
      });
    });

    return () => {
      newSocket.emit('leave_poll', pollId);
      newSocket.disconnect();
    };
  }, [pollId]);

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const organizeComments = () => {
    const topLevel = comments.filter(c => c.parentComment === null);
    const replies = comments.filter(c => c.parentComment !== null);
    
    return topLevel.map(comment => {
      const commentReplies = replies.filter(r => r.parentComment === comment._id);
      return {
        ...comment,
        replies: commentReplies
      };
    });
  };

  const organizedComments = organizeComments();

  if (loading) {
    return <div>Loading comments...</div>;
  }

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
      <h3>Comments</h3>
      
      {user ? (
        <CommentForm 
          pollId={pollId} 
          onCommentSubmitted={() => setReplyingTo(null)} 
        />
      ) : (
        <p>Please <a href="/login">login</a> to comment.</p>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {organizedComments.length === 0 ? (
        <p>No comments yet. Be the first to comment!</p>
      ) : (
        <div>
          {organizedComments.map(comment => (
            <div key={comment._id}>
              <Comment comment={comment} onReply={handleReply} />
              
              {replyingTo === comment._id && user && (
                <div style={{ marginLeft: '2rem' }}>
                  <CommentForm 
                    pollId={pollId} 
                    parentCommentId={comment._id}
                    onCommentSubmitted={() => setReplyingTo(null)}
                    onCancel={handleCancelReply}
                  />
                </div>
              )}
              
              {comment.replies && comment.replies.map(reply => (
                <Comment key={reply._id} comment={reply} onReply={() => {}} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;

import { axiosInstance } from '../lib/axios';

// Follow a user
export const followUser = async (userId) => {
  // Always send following_id as string for MongoDB compatibility
  const response = await axiosInstance.post('/followers/follow', {
    following_id: String(userId)
  });
  return response.data;
};

// Unfollow a user
export const unfollowUser = async (userId) => {
  const response = await axiosInstance.delete(`/followers/unfollow/${userId}`);
  return response.data;
};

// Get current user's followers
export const getMyFollowers = async (skip = 0, limit = 1000) => {
  const response = await axiosInstance.get('/followers/me/followers', {
    params: { skip, limit }
  });
  return response.data;
};

// Get current user's following
export const getMyFollowing = async (skip = 0, limit = 1000) => {
  const response = await axiosInstance.get('/followers/me/following', {
    params: { skip, limit }
  });
  return response.data;
};

// Get followers of a specific user
export const getUserFollowers = async (userId, skip = 0, limit = 1000) => {
  const response = await axiosInstance.get(`/followers/${userId}/followers`, {
    params: { skip, limit }
  });
  return response.data;
};

// Get following of a specific user
export const getUserFollowing = async (userId, skip = 0, limit = 1000) => {
  const response = await axiosInstance.get(`/followers/${userId}/following`, {
    params: { skip, limit }
  });
  return response.data;
};

// Check if current user follows a specific user
export const checkIsFollowing = async (userId) => {
  const response = await axiosInstance.get(`/followers/is-following/${userId}`);
  return response.data;
};

// Get follower statistics for a user
export const getFollowerStats = async (userId) => {
  const response = await axiosInstance.get(`/followers/stats/${userId}`);
  return response.data;
};

// Update follow notification settings
export const updateFollowSettings = async (userId, settings) => {
  const response = await axiosInstance.put(`/followers/settings/${userId}`, settings);
  return response.data;
};

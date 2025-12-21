import { axiosInstance as axios } from '../../../lib/axios';

// Get subscription statistics
export const getSubscriptionStats = async () => {
  const response = await axios.get('/admin/subscriptions/stats');
  return response.data;
};

// Get all subscriptions with filters
export const getAllSubscriptions = async (params = {}) => {
  const { skip = 0, limit = 20, status, plan, search } = params;
  const queryParams = new URLSearchParams();
  
  queryParams.append('skip', skip);
  queryParams.append('limit', limit);
  if (status) queryParams.append('status', status);
  if (plan) queryParams.append('plan', plan);
  if (search) queryParams.append('search', search);
  
  const response = await axios.get(`/admin/subscriptions?${queryParams}`);
  return response.data;
};

// Get subscription by ID
export const getSubscriptionById = async (subscriptionId) => {
  const response = await axios.get(`/admin/subscriptions/${subscriptionId}`);
  return response.data;
};

// Get user's subscription history
export const getUserSubscriptions = async (userId) => {
  const response = await axios.get(`/admin/subscriptions/user/${userId}`);
  return response.data;
};

// Update subscription
export const updateSubscription = async (subscriptionId, data) => {
  const response = await axios.put(`/admin/subscriptions/${subscriptionId}`, data);
  return response.data;
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId, reason = null) => {
  const response = await axios.post(`/admin/subscriptions/${subscriptionId}/cancel`, { reason });
  return response.data;
};

// Delete subscription
export const deleteSubscription = async (subscriptionId) => {
  const response = await axios.delete(`/admin/subscriptions/${subscriptionId}`);
  return response.data;
};

// Extend subscription
export const extendSubscription = async (subscriptionId, days) => {
  const response = await axios.post(`/admin/subscriptions/${subscriptionId}/extend?days=${days}`);
  return response.data;
};

// Get subscription plans
export const getSubscriptionPlans = async () => {
  const response = await axios.get('/admin/subscriptions/plans');
  return response.data;
};

// Create subscription plan
export const createSubscription = async (data) => {
  const response = await axios.post('/admin/subscriptions/create', data);
  return response.data;
};

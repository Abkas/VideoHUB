import { axiosInstance as axios } from '../lib/axios';

/**
 * Get subscription status
 * Returns: { expires_at, remaining_seconds, is_active }
 */
export const getSubscriptionStatus = async () => {
  const response = await axios.get('/subscription/status');
  return response.data;
};

/**
 * Subscribe to a plan
 * @param {string} planId - "30_min", "1_hour", "1_day", "1_week"
 */
export const subscribe = async (planId) => {
  const response = await axios.post('/subscription/subscribe', { plan_id: planId });
  return response.data;
};

/**
 * Extend subscription
 * @param {string} planId - "30_min", "1_hour", "1_day", "1_week"
 */
export const extendSubscription = async (planId) => {
  const response = await axios.post('/subscription/extend', { plan_id: planId });
  return response.data;
};

/**
 * Get all available subscription plans
 */
export const getSubscriptionPlans = async () => {
  const response = await axios.get('/subscription/plans');
  return response.data;
};

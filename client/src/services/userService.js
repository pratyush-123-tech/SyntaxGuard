import api from './api';

export const getProfile = () => api.get('/user/profile');

export const changePassword = (currentPassword, newPassword) =>
  api.put('/user/password', { currentPassword, newPassword });

export const deleteAccount = (password) =>
  api.delete('/user/account', { data: { password } });

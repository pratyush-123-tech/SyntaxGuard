import api from './api';

export const createRepository = async (name, description) => {
  const response = await api.post('/repositories', { name, description });
  return response.data;
};

export const getRepositories = async () => {
  const response = await api.get('/repositories');
  return response.data;
};

export const getRepositoryById = async (id) => {
  const response = await api.get(`/repositories/${id}`);
  return response.data;
};

export const deleteRepository = async (id) => {
  const response = await api.delete(`/repositories/${id}`);
  return response.data;
};

export const renameRepository = async (id, name) => {
  const response = await api.put(`/repositories/${id}`, { name });
  return response.data;
};

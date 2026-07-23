import api from './api';

export const submitAnalysis = (code, language, repositoryId) =>
  api.post('/analysis', { code, language, repositoryId });

export const getAnalysisHistory = (page = 1, limit = 20) =>
  api.get('/analysis', { params: { page, limit } });

export const getAnalysisById = (id) => api.get(`/analysis/${id}`);

export const deleteAnalysis = (id) => api.delete(`/analysis/${id}`);

/**
 * Stream analysis using Server-Sent Events.
 * @param {string} code
 * @param {string} language
 * @param {function} onChunk - Called with each streamed chunk
 * @param {function} onDone - Called when streaming is complete with final result
 */
export const streamAnalysis = async (code, language, repositoryId, onChunk, onDone) => {
  const token = localStorage.getItem('accessToken');

  // Use public route if not logged in, protected route if logged in
  const API_URL = import.meta.env.VITE_API_URL || '';
  const url = token ? `${API_URL}/api/analysis/stream` : `${API_URL}/api/public/analysis/stream`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ code, language, repositoryId }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split('\n').filter((l) => l.startsWith('data: '));

    for (const line of lines) {
      const json = JSON.parse(line.replace('data: ', ''));
      if (json.done) {
        onDone(json.result);
      } else if (json.chunk) {
        onChunk(json.chunk);
      }
    }
  }
};

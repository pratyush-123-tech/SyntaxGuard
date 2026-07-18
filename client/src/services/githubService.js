import api from './api';

export const getGithubStatus = () => api.get('/github/status');
export const disconnectGithub = () => api.delete('/github/disconnect');
export const saveGithubInstallation = (installationId) => api.post('/github/save-installation', { installationId });
export const getGithubReviews = () => api.get('/github/reviews');

/**
 * Returns the URL the user should visit to install our GitHub App.
 * After installing, GitHub redirects them to our /api/github/callback endpoint.
 */
export const getGithubInstallUrl = () => {
  const appName = import.meta.env.VITE_GITHUB_APP_NAME || 'ai-code-reviewer-app';
  return `https://github.com/apps/${appName}/installations/new`;
};

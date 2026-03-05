const getApiBase = () => {
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '');
  }
  return '';
};
export const API = getApiBase() ? `${getApiBase()}/api` : '/api';

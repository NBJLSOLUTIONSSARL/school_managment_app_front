import axios from 'axios';

const TOKEN_KEY = 'academie_token';
const USER_KEY = 'academie_user';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const rawApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const attachAuthInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }

      const problem = error.response?.data;
      const message = problem?.detail || problem?.message || error.message || 'Une erreur est survenue';
      const customError = new Error(message);
      customError.status = error.response?.status;
      customError.invalidParams = problem?.invalidParams || null;
      customError.raw = problem;
      return Promise.reject(customError);
    }
  );
};

attachAuthInterceptor(apiClient);
attachAuthInterceptor(rawApiClient);

export { TOKEN_KEY, USER_KEY };

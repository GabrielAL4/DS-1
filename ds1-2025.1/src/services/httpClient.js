import axios from 'axios';

export const httpClient = axios.create({
  baseURL: 'http://localhost:8080/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logs de debug
httpClient.interceptors.request.use(
  (config) => {
    //console.log('Requisição sendo feita:', config.method?.toUpperCase(), config.url);
    // console.log('Payload:', config.data);
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

httpClient.interceptors.response.use(
  (response) => {
    //console.log('Resposta recebida:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
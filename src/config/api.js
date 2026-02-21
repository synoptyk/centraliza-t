const API_URL = process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL || 'https://centraliza-t.onrender.com'
    : 'http://localhost:5005';

export default API_URL;

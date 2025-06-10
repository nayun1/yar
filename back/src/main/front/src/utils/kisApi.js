// utils/kisApi.js
import axios from 'axios';

export const fetchVolumeRank = async () => {
    const response = await axios.get('/volume-rank');
    return response.data;
};

export const fetchTradingValueRank = async () => {
    const response = await axios.get('/trading-value-rank');
    return response.data;
};

export const fetchRiseRank = async () => {
    const response = await axios.get('/rise-rank');
    return response.data;
};

export const fetchFallRank = async () => {
    const response = await axios.get('/fall-rank');
    return response.data;
};

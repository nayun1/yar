// utils/kisApi.js
import axios from 'axios';

export const fetchVolumeRank = async () => {
    const response = await axios.get('/volume-rank');
    return response.data;
};

// hooks/useVolumeRank.js
import { useEffect, useState } from 'react';
import { fetchVolumeRank } from '../utils/kisApi';

export const useVolumeRank = () => {
    const [volumeRank, setVolumeRank] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchVolumeRank()
            .then(data => {
                setVolumeRank(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err);
                setLoading(false);
            });
    }, []);

    return { volumeRank, loading, error };
};

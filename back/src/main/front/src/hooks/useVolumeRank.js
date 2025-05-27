// hooks/useVolumeRank.js
import { useEffect, useState } from 'react';
import { fetchVolumeRank } from '../utils/kisApi';

export const useVolumeRank = () => {
    const [volumeRank, setVolumeRank] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = () => {
            fetchVolumeRank()
                .then(data => {
                    setVolumeRank(data);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err);
                    setLoading(false);
                });
        };

        fetchData(); // 처음 한 번 데이터 요청

        const intervalId = setInterval(fetchData, 10000); // 10초마다 재요청

        return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 해제
    }, []);

    return { volumeRank, loading, error };
};

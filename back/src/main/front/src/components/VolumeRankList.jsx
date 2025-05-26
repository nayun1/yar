    // components/VolumeRankList.jsx
    import React from 'react';
    import { useVolumeRank } from '../hooks/useVolumeRank';

    const VolumeRankList = () => {
        const { volumeRank, loading, error } = useVolumeRank();

        console.log('volumeRank:', volumeRank); // 👈 이걸 추가

        if (loading) return <p>로딩 중...</p>;
        if (error) return <p>에러 발생: {error.message}</p>;

        return (
            <div>
                <h2>거래량 순위</h2>
                <ul>
                    {volumeRank.map((item, index) => (
                        <li key={index}>
                            {item.htsKorIsnm} - {Number(item.acmlVol).toLocaleString()}주
                        </li>
                    ))}
                </ul>

            </div>
        );
    };

    export default VolumeRankList;

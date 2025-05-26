import React from 'react';
import { useVolumeRank } from '../hooks/useVolumeRank';
import './VolumeRankList.css';

const VolumeRankList = () => {
    const { volumeRank, loading, error } = useVolumeRank();

    if (loading) return <p>로딩 중...</p>;
    if (error) return <p>에러 발생: {error.message}</p>;

    return (
        <div className="volume-rank-container">
            <h2 className="volume-rank-title">거래량 순위</h2>
            <ul className="volume-rank-list">
                {volumeRank.map((item, index) => {
                    // 등락률에 따라 색상 다르게 하기
                    const isNegative = Number(item.prdyCtrt) < 0;
                    return (
                        <li key={index} className="volume-rank-item">
                            <span className="rank-number">{item.dataRank}.</span>
                            <span className="stock-name">{item.htsKorIsnm}</span>
                            <span className="stock-price">{Number(item.stckPrpr).toLocaleString()}원</span>
                            <span className={`stock-change ${isNegative ? 'negative' : ''}`}>
                                {item.prdyCtrt}%
                            </span>
                            <span className="stock-volume">
                                거래량 {(Number(item.acmlVol) / 1_000_000).toFixed(1)}백만 주
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default VolumeRankList;

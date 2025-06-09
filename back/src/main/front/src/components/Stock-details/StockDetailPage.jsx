import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const StockDetailPage = () => {
    const { code } = useParams();
    const [stockInfo, setStockInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStockData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(`/stock/${code}`);
                console.log("받은 데이터:", response.data);
                setStockInfo(response.data);
            } catch (err) {
                console.error("주식 데이터 가져오기 실패:", err);
                setError("주식 데이터를 가져오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        if (code) {
            fetchStockData();
        }
    }, [code]);

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!stockInfo) {
        return <div>데이터가 없습니다.</div>;
    }

    // 숫자 포맷팅 함수 (천단위 구분)
    const formatNumber = (num) => {
        return new Intl.NumberFormat('ko-KR').format(num);
    };

    return (
        <div>
            <h1>{code} 상세 정보</h1>
            <p>시가: {formatNumber(stockInfo.openPrice)}원</p>
            <p>고가: {formatNumber(stockInfo.highPrice)}원</p>
            <p>저가: {formatNumber(stockInfo.lowPrice)}원</p>
            <p>종가: {formatNumber(stockInfo.closePrice)}원</p>
            <p>거래량: {formatNumber(stockInfo.volume)}</p>
        </div>
    );
};

export default StockDetailPage;

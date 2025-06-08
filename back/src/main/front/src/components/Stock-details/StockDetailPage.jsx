// StockDetailPage.jsx or .tsx
import { useParams } from 'react-router-dom';

const StockDetailPage = () => {
    const { code } = useParams();

    // 실제로는 API를 통해 종목 정보를 불러오면 좋음
    return (
        <div className="stock-detail-page">
            <h1>{code} 상세 정보</h1>
            {/* 종목 차트, 뉴스, 기업 정보 등 추가 가능 */}
        </div>
    );
};

export default StockDetailPage;
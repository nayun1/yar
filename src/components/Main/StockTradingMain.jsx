import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import './StockTradingMain.css';

const StockTradingMain = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentPage, setCurrentPage] = useState(1);

    // 실시간 시간 업데이트
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // 샘플 주식 데이터 (토스와 동일하게)
    const stockData = [
        { rank: 11, name: '한화오션', price: 76300, change: -1.2, volume: 4.4 },
        { rank: 12, name: '삼성전자', price: 54600, change: -0.1, volume: 4.0 },
        { rank: 13, name: '신풍제약', price: 10730, change: 2.4, volume: 4.0 },
        { rank: 14, name: '진원생명과학', price: 3820, change: 13.5, volume: 3.6 },
        { rank: 15, name: '평화홀딩스', price: 9480, change: 3.0, volume: 3.2 },
        { rank: 16, name: 'SK하이닉스', price: 200000, change: 1.5, volume: 3.0 },
        { rank: 17, name: '지투파워', price: 9590, change: 1.2, volume: 2.9 },
        { rank: 18, name: '삼성바이오로직스', price: 1041000, change: -3.6, volume: 2.5 },
        { rank: 19, name: '케이씨티', price: 3105, change: 18.0, volume: 2.5 },
        { rank: 20, name: '보성파워텍', price: 3180, change: 7.0, volume: 2.5 }
    ];

    // 지수 데이터 (토스와 유사하게)
    const indexData = [
        { name: '코스피', value: 2598.10, change: -4.43, percentage: -0.1, chart: '📈' },
        { name: '코스닥', value: 715.86, change: -1.81, percentage: -0.2, chart: '📈' },
        { name: '나스닥', value: 18925.74, change: 53.1, percentage: 0.2, chart: '📊' },
        { name: 'S&P 500', value: 5842.01, change: -2.6, percentage: -0.04, chart: '📈' },
        { name: 'VIX', value: 20.28, change: -0.59, percentage: -2.8, chart: '📉' },
        { name: '환율', value: 1374.20, change: -4.2, percentage: -0.3, chart: '📈' },
        { name: '달러 인덱스', value: 99.64, change: -0.32, percentage: -0.3, chart: '📈' }
    ];

    const formatTime = (date) => {
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatPrice = (price) => {
        return price.toLocaleString() + '원';
    };

    const getChangeClass = (change) => {
        if (change > 0) return 'change-positive';
        if (change < 0) return 'change-negative';
        return 'change-neutral';
    };

    const getChangeIcon = (change) => {
        if (change > 0) return <TrendingUp className="change-icon" />;
        if (change < 0) return <TrendingDown className="change-icon" />;
        return null;
    };

    return (
        <div className="app-container">
            {/* 헤더 */}
            <div className="header">
                <div className="header-content">
                    <div className="header-left">
                        <div className="logo">
                            <span className="logo-text">Young & Rich</span>
                        </div>
                        <nav className="main-nav">
                            <span className="nav-item">홈</span>
                            <span className="nav-item">뉴스</span>
                            <span className="nav-item">관심</span>
                            <span className="nav-item">내 자산</span>
                        </nav>
                    </div>
                    <div className="header-right">
                        <div className="search-bar">
                            <span className="search-placeholder">종목명을 검색하세요</span>
                        </div>
                        <button className="login-btn">로그인</button>
                        <button className="signup-btn">회원가입</button>
                    </div>
                </div>
            </div>

            <div className="main-layout">
                {/* 메인 콘텐츠 */}
                <div className="main-content">
                    {/* 실시간 차트 헤더 */}
                    <div className="chart-header">
                        <div className="title-section">
                            <h1 className="main-title">
                                실시간 차트
                                <span className="time-label">오늘 {formatTime(currentTime)} 기준</span>
                            </h1>
                        </div>

                        {/* 필터 탭 */}
                        <div className="filter-tabs">
                            <button className="tab active">거래대금</button>
                            <button className="tab">거래량</button>
                            <button className="tab">거래대금</button>
                            <button className="tab">거래량</button>
                            <button className="tab">급상승</button>
                            <button className="tab">급하락</button>
                            <button className="tab">인기</button>
                        </div>

                        {/* 시간 필터 */}
                        <div className="time-filters">
                            <button className="time-tab active">실시간</button>
                            <button className="time-tab">1일</button>
                            <button className="time-tab">1주일</button>
                            <button className="time-tab">1개월</button>
                            <button className="time-tab">3개월</button>
                            <button className="time-tab">6개월</button>
                            <button className="time-tab">1년</button>
                        </div>
                    </div>

                    {/* 주식 테이블 */}
                    <div className="stock-table">
                        <div className="table-header">
                            <div>종목</div>
                            <div>현재가</div>
                            <div>등락률</div>
                            <div>거래대금 많은 순</div>
                        </div>

                        {stockData.map((stock) => (
                            <div key={stock.rank} className="table-row">
                                <div className="stock-info">
                                    <span className="rank">{stock.rank}</span>
                                    <div className="company-icon">🏢</div>
                                    <span className="name">{stock.name}</span>
                                </div>
                                <div className="price">{formatPrice(stock.price)}</div>
                                <div className={`change ${getChangeClass(stock.change)}`}>
                                    {stock.change > 0 ? '+' : ''}{stock.change}%
                                </div>
                                <div className="volume">{stock.volume}억원</div>
                            </div>
                        ))}

                        {/* 페이지네이션 */}
                        <div className="pagination">
                            <button className="page-btn">
                                <ChevronLeft className="page-icon"/>
                            </button>
                            <button className="page-number">1</button>
                            <button className="page-number">2</button>
                            <button className="page-number active">3</button>
                            <button className="page-number">4</button>
                            <button className="page-number">5</button>
                            <span className="page-dots">...</span>
                            <button className="page-number">10</button>
                            <button className="page-btn">
                                <ChevronRight className="page-icon"/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 사이드바 - 지수만 */}
                <div className="sidebar">
                    <div className="sidebar-tabs">
                        <button className="sidebar-tab active">지수 · 환율</button>
                    </div>

                    <div className="index-list">
                        {indexData.map((index, i) => (
                            <div key={i} className="index-item">
                                <div className="index-chart">{index.chart}</div>
                                <div className="index-info">
                                    <div className="index-name">{index.name}</div>
                                    <div className="index-value">
                                        {index.value.toLocaleString()}
                                        <span className={`index-change ${getChangeClass(index.change)}`}>
                      {index.change > 0 ? '+' : ''}{index.change}({index.percentage > 0 ? '+' : ''}{index.percentage}%)
                    </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="news-section">
                        <div className="news-tabs">
                            <button className="news-tab active">주요 뉴스</button>
                            <button className="news-tab">추천 뉴스</button>
                        </div>

                        <div className="news-item">
                            <div className="news-image">📰</div>
                            <div className="news-content">
                                <div className="news-title">코스피, 개인 매수 2600억 원</div>
                                <div className="news-subtitle">외국.. 원자재 강세</div>
                                <div className="news-time">1시간 전 · 한국경제</div>
                            </div>
                        </div>

                        <div className="news-item">
                            <div className="news-image">📊</div>
                            <div className="news-content">
                                <div className="news-title">[ETF 시황] 美 USA 진짜모든 강보</div>
                                <div className="news-subtitle">함.. 경기스패피 섹터 투도히지</div>
                                <div className="news-time">1시간 전 · 연합인포맥스</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockTradingMain;
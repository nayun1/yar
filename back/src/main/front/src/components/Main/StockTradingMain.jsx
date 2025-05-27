import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, User, LogOut } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import LoginModal from '../common/LoginModal';
import KakaoAuth from '../../utils/KakaoAuth';
import { fetchVolumeRank } from '../../utils/kisApi';
import './StockTradingMain.css';

const StockTradingMain = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentPage, setCurrentPage] = useState(1);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // 거래량 순위 상태 추가
    const [volumeRankData, setVolumeRankData] = useState([]);
    const [stockDataLoading, setStockDataLoading] = useState(true);
    const [stockDataError, setStockDataError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('거래대금'); // 현재 활성 필터

    // 인증 상태 관리
    const { isLoggedIn, userInfo, loading, logout } = useAuth();

    // 실시간 시간 업데이트
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // API에서 거래량 순위 데이터 가져오기
    useEffect(() => {
        const loadVolumeRankData = async () => {
            try {
                setStockDataLoading(true);
                const data = await fetchVolumeRank();
                setVolumeRankData(data);
                setStockDataError(null);
            } catch (error) {
                console.error('거래량 순위 데이터 로딩 실패:', error);
                setStockDataError(error.message);
            } finally {
                setStockDataLoading(false);
            }
        };

        loadVolumeRankData();

        // 10초마다 데이터 새로고침 (실시간 업데이트)
        const interval = setInterval(loadVolumeRankData, 10000);

        return () => clearInterval(interval);
    }, []);

    // API 데이터를 화면 표시용 형태로 변환
    const transformApiDataToDisplayFormat = (apiData) => {
        return apiData.map((item, index) => ({
            rank: parseInt(item.dataRank) || (index + 1),
            name: item.htsKorIsnm || '종목명 없음',
            price: parseInt(item.stckPrpr) || 0,
            change: parseFloat(item.prdyCtrt) || 0,
            volume: Math.round((parseInt(item.acmlVol) || 0) / 1000000 * 10) / 10 // 억원 단위로 변환 (대략적)
        }));
    };

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

    const getUserDisplayName = () => {
        if (!userInfo) return '';

        const { kakao_account, properties } = userInfo;

        // 닉네임 우선, 없으면 이름 사용
        if (properties?.nickname) return properties.nickname;
        if (kakao_account?.profile?.nickname) return kakao_account.profile.nickname;
        if (kakao_account?.name) return kakao_account.name;

        return '사용자';
    };

    const getUserProfileImage = () => {
        if (!userInfo) return null;

        const { kakao_account, properties } = userInfo;

        // 프로필 이미지 URL 가져오기 (여러 경로 시도)
        if (kakao_account?.profile?.profile_image_url) {
            return kakao_account.profile.profile_image_url;
        }
        if (kakao_account?.profile?.thumbnail_image_url) {
            return kakao_account.profile.thumbnail_image_url;
        }
        if (properties?.profile_image) {
            return properties.profile_image;
        }
        if (properties?.thumbnail_image) {
            return properties.thumbnail_image;
        }

        return null;
    };

    const handleLoginClick = () => {
        setShowLoginModal(true);
    };

    const handleKakaoLogin = () => {
        KakaoAuth.login();
    };

    // 필터 탭 클릭 핸들러
    const handleFilterClick = (filterName) => {
        setActiveFilter(filterName);
        // 여기에 각 필터에 따른 API 호출 로직을 추가할 수 있습니다
        console.log(`필터 변경: ${filterName}`);
    };

    // API 데이터를 변환하여 표시
    const currentStockData = transformApiDataToDisplayFormat(volumeRankData);

    return (
        <div className="app-container">
            {/* 헤더 */}
            <div className="header">
                <div className="header-content">
                    <div className="header-left">
                        <div className="logo">
                            <a href="/" className="logo-link">
                                <img src="/images/logo.png" alt="Young & Rich" className="logo-image"/>
                            </a>
                        </div>
                        <nav className="main-nav">
                            <span className="nav-item">홈</span>
                            <span className="nav-item">관심</span>
                            <a href="/my-assets" className="nav-item">내 자산</a>
                        </nav>
                    </div>
                    <div className="header-right">
                        <div className="search-bar">
                            <span className="search-placeholder">종목명을 검색하세요</span>
                        </div>

                        {loading ? (
                            <div className="login-loading">로딩...</div>
                        ) : isLoggedIn ? (
                            <div className="user-info-container">
                                <div className="user-profile">
                                    {getUserProfileImage() ? (
                                        <img
                                            src={getUserProfileImage()}
                                            alt="프로필"
                                            className="profile-image"
                                        />
                                    ) : (
                                        <User className="profile-icon" />
                                    )}
                                    <span className="user-name">{getUserDisplayName()}</span>
                                </div>
                                <button className="logout-btn" onClick={logout}>
                                    로그아웃
                                </button>
                            </div>
                        ) : (
                            <button className="login-btn" onClick={handleLoginClick}>
                                로그인
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 로그인 모달 */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onKakaoLogin={handleKakaoLogin}
            />

            <div className="main-layout">
                {/* 메인 콘텐츠 */}
                <div className="main-content">
                    {/* 실시간 차트 헤더 */}
                    <div className="chart-header">
                        <div className="title-section">
                            <h1 className="main-title">
                                실시간 차트
                                <span className="time-label">오늘 {formatTime(currentTime)} 기준</span>
                                {stockDataLoading && <span className="loading-indicator"> (데이터 로딩 중...)</span>}
                                {stockDataError && <span className="error-indicator"> (데이터 로딩 실패)</span>}
                            </h1>
                        </div>

                        {/* 필터 탭 */}
                        <div className="filter-tabs">
                            {['거래대금', '거래량', '급상승', '급하락'].map((filter) => (
                                <button
                                    key={filter}
                                    className={`tab ${activeFilter === filter ? 'active' : ''}`}
                                    onClick={() => handleFilterClick(filter)}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 주식 테이블 */}
                    <div className="stock-table">
                        <div className="table-header">
                            <div>종목</div>
                            <div>현재가</div>
                            <div>등락률</div>
                            <div>거래량 많은 순</div>
                        </div>

                        {stockDataLoading ? (
                            <div className="loading-container">
                                <p>거래량 순위 데이터를 불러오는 중...</p>
                            </div>
                        ) : stockDataError ? (
                            <div className="error-container">
                                <p>데이터를 불러올 수 없습니다.</p>
                                <p>오류: {stockDataError}</p>
                            </div>
                        ) : currentStockData.length === 0 ? (
                            <div className="empty-container">
                                <p>표시할 데이터가 없습니다.</p>
                            </div>
                        ) : (
                            currentStockData.map((stock) => (
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
                                    <div className="volume">{stock.volume}백만 주</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockTradingMain;
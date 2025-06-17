// src/components/MyAssets/MyAssets.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { User, LogOut, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoginModal from '../common/LoginModal';
import KakaoAuth from '../../utils/KakaoAuth';
import { TradeContext } from '../Main/TradeContext'; // TradeContext import 추가
import './MyAssets.css';

const MyAssets = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [activeTab, setActiveTab] = useState('assets');

    // 인증 상태 관리
    const { isLoggedIn, userInfo, loading, logout } = useAuth();

    // TradeContext에서 보유 종목 데이터 가져오기
    const { balance, stocks } = useContext(TradeContext);

    // 실시간 현재가 상태
    const [currentPrices, setCurrentPrices] = useState({});
    const [stockNames, setStockNames] = useState({}); // 종목명 저장

    // 네비게이션 훅
    const navigate = useNavigate();

    // TradeContext의 stocks 데이터를 holdings 형태로 변환
    const getHoldingsData = () => {
        return Object.entries(stocks).map(([stockCode, stockInfo]) => {
            const stockName = stockNames[stockCode] || stockCode; // API에서 가져온 종목명 사용
            const currentPrice = currentPrices[stockCode] || stockInfo.averagePrice;

            return {
                code: stockCode,
                name: stockName, // 종목명만 표시
                quantity: stockInfo.quantity,
                currentPrice: currentPrice,
                avgPrice: stockInfo.averagePrice
            };
        }).sort((a, b) => {
            // 평가금액이 높은 순서로 정렬
            const evaluationA = a.quantity * a.currentPrice;
            const evaluationB = b.quantity * b.currentPrice;
            return evaluationB - evaluationA;
        });
    };

    // 백엔드 API에서 실시간 현재가 가져오기
    const fetchCurrentPrices = async () => {
        try {
            const stockCodes = Object.keys(stocks);
            if (stockCodes.length === 0) return;

            const pricePromises = stockCodes.map(async (stockCode) => {
                try {
                    const response = await fetch(`/api/stocks/detail/${stockCode}`);
                    if (response.ok) {
                        const data = await response.json();
                        return {
                            stockCode,
                            price: parseInt(data.currentPrice?.replace(/,/g, '') || '0')
                        };
                    }
                } catch (error) {
                    console.error(`${stockCode} 현재가 조회 실패:`, error);
                }
                return null;
            });

            const results = await Promise.all(pricePromises);
            const newPrices = {};

            results.forEach(result => {
                if (result) {
                    newPrices[result.stockCode] = result.price;
                }
            });

            setCurrentPrices(newPrices);
        } catch (error) {
            console.error('현재가 조회 실패:', error);
        }
    };

    // 실시간 시간 업데이트
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // 컴포넌트 마운트 시 및 주기적으로 현재가 업데이트
    useEffect(() => {
        const fetchCurrentPrices = async () => {
            try {
                const stockCodes = Object.keys(stocks);
                if (stockCodes.length === 0) return;

                const pricePromises = stockCodes.map(async (stockCode) => {
                    try {
                        const response = await fetch(`/api/stocks/detail/${stockCode}`);
                        if (response.ok) {
                            const data = await response.json();
                            return {
                                stockCode,
                                price: parseInt(data.currentPrice?.replace(/,/g, '') || '0'),
                                name: data.companyName // 종목명도 함께 가져오기
                            };
                        }
                    } catch (error) {
                        console.error(`${stockCode} 현재가 조회 실패:`, error);
                    }
                    return null;
                });

                const results = await Promise.all(pricePromises);
                const newPrices = {};
                const newNames = {};

                results.forEach(result => {
                    if (result) {
                        newPrices[result.stockCode] = result.price;
                        newNames[result.stockCode] = result.name;
                    }
                });

                setCurrentPrices(newPrices);
                setStockNames(newNames);
            } catch (error) {
                console.error('현재가 조회 실패:', error);
            }
        };

        fetchCurrentPrices();

        // 10초마다 현재가 업데이트 (StockDetailPage와 동일)
        const priceInterval = setInterval(fetchCurrentPrices, 10000);

        return () => clearInterval(priceInterval);
    }, [stocks]);

    const formatTime = (date) => {
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatNumber = (num) => {
        return num.toLocaleString('ko-KR');
    };

    const getUserDisplayName = () => {
        if (!userInfo) return '';

        const { kakao_account, properties } = userInfo;

        if (properties?.nickname) return properties.nickname;
        if (kakao_account?.profile?.nickname) return kakao_account.profile.nickname;
        if (kakao_account?.name) return kakao_account.name;

        return '사용자';
    };

    const getUserProfileImage = () => {
        if (!userInfo) return null;

        const { kakao_account, properties } = userInfo;

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

    // 종목 클릭 핸들러
    const handleStockClick = (stock) => {
        navigate(`/stock/${stock.code}`, {
            state: {
                stockData: {
                    code: stock.code,
                    name: stock.name,
                    price: stock.currentPrice,
                    change: stock.currentPrice > stock.avgPrice ?
                        ((stock.currentPrice - stock.avgPrice) / stock.avgPrice * 100) :
                        -((stock.avgPrice - stock.currentPrice) / stock.avgPrice * 100)
                }
            }
        });
    };
    
    // 총 투자금액과 평가금액 계산
    const calculateTotalAssets = () => {
        const holdingsData = getHoldingsData();
        let totalInvestment = 0;
        let totalEvaluation = 0;

        holdingsData.forEach(stock => {
            totalInvestment += stock.quantity * stock.avgPrice;
            totalEvaluation += stock.quantity * stock.currentPrice;
        });

        const totalProfit = totalEvaluation - totalInvestment;
        const totalAssets = balance + totalEvaluation;

        return {
            totalAssets,
            totalInvestment,
            totalEvaluation,
            totalProfit,
            availableBalance: balance
        };
    };

    // 탭별 콘텐츠 렌더링
    const renderTabContent = () => {
        const { totalAssets, totalEvaluation, totalProfit, availableBalance } = calculateTotalAssets();
        const profitPercent = totalEvaluation > 0 ? ((totalProfit / (totalAssets - availableBalance)) * 100) : 0;

        switch(activeTab) {
            case 'assets':
                return (
                    <>
                        {/* 총 자산 섹션 */}
                        <div className="total-assets-section">
                            <h3 className="assets-section-title">총 자산</h3>
                            <div className="total-assets-amount">{formatNumber(totalAssets)}원</div>
                            <div className={`total-assets-change ${totalProfit >= 0 ? 'positive' : 'negative'}`}>
                                {totalProfit >= 0 ? '+' : ''}{formatNumber(totalProfit)}원 ({profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%)
                            </div>
                        </div>

                        {/* 포트폴리오 카드 그리드 */}
                        <div className="portfolio-grid">
                            {/* 주문 가능 금액 카드 */}
                            <div className="portfolio-card">
                                <h3 className="card-section-title">주문 가능 금액</h3>
                                <div className="card-content">
                                    <div className="card-details">
                                        <div className="card-label">원화</div>
                                        <div className="card-amount">{formatNumber(availableBalance)}원</div>
                                    </div>
                                </div>
                            </div>

                            {/* 투자중인 금액 카드 */}
                            <div className="portfolio-card">
                                <h3 className="card-section-title">투자중인 금액</h3>
                                <div className="card-content">
                                    <div className="card-details">
                                        <div className="card-label">주식</div>
                                        <div className="card-amount">{formatNumber(totalEvaluation)}원</div>
                                        <div className={`card-change ${totalProfit >= 0 ? 'positive' : 'negative'}`}>
                                            {totalProfit >= 0 ? '+' : ''}{formatNumber(totalProfit)}원 ({profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );

            case 'holdings':
                const holdingsData = getHoldingsData();

                return (
                    <div className="holdings-section">
                        {holdingsData.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                color: '#888'
                            }}>
                                <h3 style={{color: '#fff', marginBottom: '12px'}}>보유중인 종목이 없습니다</h3>
                                <p>거래를 통해 종목을 매수해보세요</p>
                            </div>
                        ) : (
                            <div className="holdings-table">
                                <div className="holdings-table-header">
                                    <div className="holdings-header-cell name">종목명</div>
                                    <div className="holdings-header-cell">총 수익률</div>
                                    <div className="holdings-header-cell">총 수익금</div>
                                    <div className="holdings-header-cell">현재가</div>
                                    <div className="holdings-header-cell">보유 수량</div>
                                    <div className="holdings-header-cell">평단가</div>
                                    <div className="holdings-header-cell">평가금액</div>
                                </div>
                                {holdingsData.map((stock, index) => {
                                    const evaluationAmount = stock.quantity * stock.currentPrice;
                                    const totalInvestment = stock.quantity * stock.avgPrice;
                                    const totalProfit = evaluationAmount - totalInvestment;
                                    const totalProfitPercent = totalInvestment > 0 ? ((totalProfit / totalInvestment) * 100) : 0;

                                    return (
                                        <div
                                            key={stock.code}
                                            className="holdings-table-row"
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => handleStockClick(stock)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    handleStockClick(stock);
                                                }
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="holdings-cell name">{stock.name}</div>
                                            <div className={`holdings-cell ${totalProfit >= 0 ? (totalProfit === 0 ? 'neutral' : 'positive') : 'negative'}`}>
                                                {totalProfitPercent >= 0 && totalProfitPercent !== 0 ? '+' : ''}{totalProfitPercent.toFixed(2)}%
                                            </div>
                                            <div className={`holdings-cell ${totalProfit >= 0 ? (totalProfit === 0 ? 'neutral' : 'positive') : 'negative'}`}>
                                                {totalProfit >= 0 && totalProfit !== 0 ? '+' : ''}{formatNumber(totalProfit)}원
                                            </div>
                                            <div className="holdings-cell">{formatNumber(stock.currentPrice)}원</div>
                                            <div className="holdings-cell">{formatNumber(stock.quantity)}주</div>
                                            <div className="holdings-cell">{formatNumber(stock.avgPrice)}원</div>
                                            <div className="holdings-cell">{formatNumber(evaluationAmount)}원</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    // 로그인이 필요한 경우
    if (!isLoggedIn && !loading) {
        return (
            <div className="assets-app-container">
                {/* 헤더 */}
                <div className="assets-header">
                    <div className="assets-header-content">
                        <div className="assets-header-left">
                            <div className="assets-logo">
                                <a href="/" className="assets-logo-link">
                                    <img src="/images/logo.png" alt="Young & Rich" className="assets-logo-image"/>
                                </a>
                            </div>
                            <nav className="assets-main-nav">
                                <a href="/" className="assets-nav-item">홈</a>
                                <span className="assets-nav-item active">내 자산</span>
                            </nav>
                        </div>
                        <div className="assets-header-right">
                            <button className="assets-login-btn" onClick={handleLoginClick}>
                                로그인
                            </button>
                        </div>
                    </div>
                </div>

                {/* 로그인 안내 메시지 */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 'calc(100vh - 120px)',
                    textAlign: 'center',
                    color: '#888'
                }}>
                    <div style={{marginBottom: '16px'}}>
                        <img
                            src="/images/lock.png"
                            alt="자물쇠"
                            style={{
                                width: '100px',
                                height: '100px',
                                objectFit: 'contain',
                            }}
                        />
                    </div>
                    <h2 style={{color: '#fff', marginBottom: '12px', fontSize: '20px'}}>로그인이 필요합니다</h2>
                    <p style={{marginBottom: '24px', fontSize: '16px'}}>내 자산을 확인하려면 로그인해주세요</p>
                </div>

                {/* 로그인 모달 */}
                <LoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onKakaoLogin={handleKakaoLogin}
                />
            </div>
        );
    }

    return (
        <div className="assets-app-container">
            {/* 헤더 */}
            <div className="assets-header">
                <div className="assets-header-content">
                    <div className="assets-header-left">
                        <div className="assets-logo">
                            <a href="/" className="assets-logo-link">
                                <img src="/images/logo.png" alt="Young & Rich" className="assets-logo-image"/>
                            </a>
                        </div>
                        <nav className="assets-main-nav">
                            <a href="/" className="assets-nav-item">홈</a>
                            <span className="assets-nav-item active">내 자산</span>
                        </nav>
                    </div>
                    <div className="assets-header-right">
                        {loading ? (
                            <div className="assets-login-loading">로딩...</div>
                        ) : (
                            <div className="assets-user-info-container">
                                <div className="assets-user-profile">
                                    {getUserProfileImage() ? (
                                        <img
                                            src={getUserProfileImage()}
                                            alt="프로필"
                                            className="assets-profile-image"
                                        />
                                    ) : (
                                        <User className="assets-profile-icon" />
                                    )}
                                    <span className="assets-user-name">{getUserDisplayName()}</span>
                                </div>
                                <button className="assets-logout-btn" onClick={logout}>
                                    로그아웃
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="assets-layout">
                {/* 사이드바 */}
                <div className="assets-sidebar">
                    <div className="sidebar-menu">
                        <button
                            className={`sidebar-menu-item ${activeTab === 'assets' ? 'active' : ''}`}
                            onClick={() => setActiveTab('assets')}
                        >
                            자산
                        </button>
                        <button
                            className={`sidebar-menu-item ${activeTab === 'holdings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('holdings')}
                        >
                            보유종목
                        </button>
                    </div>
                </div>

                {/* 메인 콘텐츠 영역 */}
                <div className="assets-main">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default MyAssets;

//StockDetailPage.jsx
import React, { useContext, useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, User, Minus, Plus } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import LoginModal from '../common/LoginModal';
import KakaoAuth from '../../utils/KakaoAuth';
import StockSearch from "../Main/StockSearch";
import TimeCandleChart from "./TimeCandleChart";
import DayCandleChart from "./DayCandleChart";
import WeekCandleChart from "./WeekCandleChart";
import MonthCandleChart from "./MonthCandleChart";
import YearCandleChart from "./YearCandleChart";
import {TradeContext} from "../Main/TradeContext";
import './StockDetailPage.css';


const StockDetailPage = () => {
    const { code } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showQuantityAlert, setShowQuantityAlert] = useState(false);
    const [selectedType, setSelectedType] = useState("time"); // 기본값은 "time"

    // 주문 관련 상태
    const [orderType, setOrderType] = useState('buy'); // 'buy', 'sell'
    const [priceType, setPriceType] = useState('지정가'); // '지정가', '시장가'
    const [orderPrice, setOrderPrice] = useState('');
    const [orderQuantity, setOrderQuantity] = useState(''); // 빈 문자열로 초기화
    const {balance,stocks, buyStock} = useContext(TradeContext);

    // 인증 상태 관리
    const { isLoggedIn, userInfo, loading: authLoading, logout } = useAuth();

    useEffect(() => {
        // state로 전달된 데이터가 있는지 확인
        if (location.state?.stockData) {
            setStockData(location.state.stockData);
            setLoading(false);
        } else {
            // state 데이터가 없으면 API로 개별 종목 정보 조회
            fetchStockDetail(code);
        }
    }, [code, location.state]);

    // 주식 데이터가 로드되면 주문 가격 초기화 (한번만)
    useEffect(() => {
        if (stockData && stockData.price && orderPrice === '') {
            setOrderPrice(stockData.price.toLocaleString());
        }
    }, [stockData]);

    // 10초마다 주가 정보 자동 새로고침
    useEffect(() => {
        if (!stockData?.code) return;

        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/api/stocks/detail/${stockData.code}`);
                if (response.ok) {
                    const data = await response.json();

                    // 현재가와 등락률만 업데이트 (주문 가격은 건드리지 않음)
                    setStockData(prevData => ({
                        ...prevData,
                        price: parseInt(data.currentPrice?.replace(/,/g, '') || prevData.price),
                        change: parseFloat(data.changeRate?.replace('%', '') || prevData.change),
                        currentPrice: data.currentPrice,
                        changeRate: data.changeRate,
                        changeAmount: data.changeAmount,
                        volume: data.volume,
                        tradingValue: data.tradingValue
                    }));
                }
            } catch (error) {
                console.error('주가 자동 새로고침 실패:', error);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [stockData?.code]);

    const renderChart = () => {
        switch (selectedType) {
            case "time":
                return <TimeCandleChart stockCode={code} />;
            case "daily":
                return <DayCandleChart stockCode={code} />;
            case "weekly":
                return <WeekCandleChart stockCode={code} />;
            case "monthly":
                return <MonthCandleChart stockCode={code} />;
            case "yearly":
                return <YearCandleChart stockCode={code} />;
            default:
                return null;
        }
    };

    const fetchStockDetail = async (stockCode) => {
        try {
            setLoading(true);

            // 새로운 API 엔드포인트 호출
            const response = await fetch(`/api/stocks/detail/${stockCode}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // 백엔드 DTO 필드명을 프론트엔드 형식으로 변환
            const transformedData = {
                name: data.companyName,        // companyName -> name
                code: data.stockCode,          // stockCode -> code
                price: parseInt(data.currentPrice?.replace(/,/g, '') || '0'), // 현재가
                change: parseFloat(data.changeRate?.replace('%', '') || '0'),  // 등락률
                marketIcon: data.marketIcon,
                // 실시간 데이터
                currentPrice: data.currentPrice,
                changeRate: data.changeRate,
                changeAmount: data.changeAmount,
                volume: data.volume,
                tradingValue: data.tradingValue,
                isRealTimeAvailable: data.isRealTimeAvailable
            };

            setStockData(transformedData);

        } catch (error) {
            console.error('종목 상세 정보 조회 실패:', error);
            setStockData(null);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return price.toLocaleString() + '원';
    };

    const getChangeClass = (change) => {
        if (change > 0) return 'detail-change-positive';
        if (change < 0) return 'detail-change-negative';
        return 'detail-change-neutral';
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

    const getChangeIcon = (change) => {
        if (change > 0) return <TrendingUp className="detail-change-icon" />;
        if (change < 0) return <TrendingDown className="detail-change-icon" />;
        return null;
    };

    // 호가 단위 계산 함수
    const getTickSize = (price) => {
        if (price < 2000) return 1;
        if (price < 5000) return 5;
        if (price < 20000) return 10;
        if (price < 50000) return 50;
        if (price < 200000) return 100;
        if (price < 500000) return 500;
        return 1000;
    };

    // 주문 관련 핸들러
    const handlePriceChange = (e) => {
        const fullValue = e.target.value;
        // "원"을 제거하고 숫자만 추출
        const rawValue = fullValue.replace(/[^0-9]/g, '');
        if (rawValue === '') {
            setOrderPrice('0');
        } else {
            setOrderPrice(parseInt(rawValue).toLocaleString());
        }
    };

    const adjustPrice = (direction) => {
        const currentPrice = parseInt(orderPrice.replace(/,/g, '')) || 0;
        const tickSize = getTickSize(stockData.price); // 주식의 현재 주가 기준으로 호가 단위 결정
        const increment = direction > 0 ? tickSize : -tickSize;
        const newPrice = Math.max(0, currentPrice + increment);
        setOrderPrice(newPrice.toLocaleString());
    };

    const handleQuantityChange = (e) => {
        const fullValue = e.target.value;
        // "주"를 제거하고 숫자만 추출
        const rawValue = fullValue.replace(/[^0-9]/g, '');
        setOrderQuantity(rawValue);
    };

    const adjustQuantity = (increment) => {
        const currentQuantity = parseInt(orderQuantity) || 0;
        const newQuantity = Math.max(1, currentQuantity + increment);
        setOrderQuantity(newQuantity.toString());
    };

    const calculateTotalPrice = () => {
        let price;
        if (priceType === '시장가') {
            price = stockData.price; // 시장가일 때는 현재가 사용
        } else {
            price = parseInt(orderPrice.replace(/,/g, '')) || 0; // 지정가일 때는 입력한 가격 사용
        }
        const quantity = parseInt(orderQuantity) || 0;
        return price * quantity;
    };

    const handleOrder = () => {
        if (!isLoggedIn) {
            setShowLoginModal(true);
            return;
        }

        // 수량이 입력되지 않았거나 0인 경우
        if (!orderQuantity || parseInt(orderQuantity) <= 0) {
            setShowQuantityAlert(true);
            return;
        }

        // 주문 처리 로직
        console.log('주문 실행:', {
            orderType,
            priceType,
            price: priceType === '시장가' ? stockData.price : parseInt(orderPrice.replace(/,/g, '')),
            quantity: parseInt(orderQuantity),
            total: calculateTotalPrice()
        });

        const actionText = orderType === 'buy' ? '구매' : '판매';
        alert(`${actionText} 주문이 접수되었습니다.`);
    };

    const getOrderButtonText = () => {
        if (!isLoggedIn) return '로그인하고 구매하기';
        switch (orderType) {
            case 'buy': return '구매하기';
            case 'sell': return '판매하기';
            default: return '구매하기';
        }
    };

    const getOrderButtonClass = () => {
        let baseClass = 'detail-order-btn';
        if (!isLoggedIn) {
            baseClass += ' detail-login-required';
        } else if (orderType === 'sell') {
            baseClass += ' detail-sell';
        }
        return baseClass;
    };

    const getQuantityDisplayValue = () => {
        if (!orderQuantity) return '';
        return `${orderQuantity} 주`;
    };

    if (loading) {
        return (
            <div className="stock-detail-page">
                <div className="detail-container">
                    <div className="detail-loading-container">
                        <p>종목 정보를 불러오는 중...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!stockData) {
        return (
            <div className="stock-detail-page">
                <div className="detail-container">
                    <div className="detail-error-container">
                        <p>종목 정보를 찾을 수 없습니다.</p>
                        <button
                            className="detail-error-button"
                            onClick={() => navigate('/')}
                        >
                            메인으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="stock-detail-page">
            {/* 헤더 */}
            <div className="detail-header">
                <div className="detail-header-content">
                    <div className="detail-header-left">
                        <div className="detail-logo">
                            <a href="/" className="detail-logo-link">
                                <img src="/images/logo.png" alt="Young & Rich" className="detail-main-logo-image"/>
                            </a>
                        </div>
                        <nav className="detail-main-nav">
                            <a href="/" className="detail-nav-item">홈</a>
                            <a href="/my-assets" className="detail-nav-item">내 자산</a>
                        </nav>
                    </div>
                    <div className="detail-header-right">
                        <StockSearch/>

                        {authLoading ? (
                            <div className="detail-login-loading">로딩...</div>
                        ) : isLoggedIn ? (
                            <div className="detail-user-info-container">
                                <div className="detail-user-profile">
                                    {getUserProfileImage() ? (
                                        <img
                                            src={getUserProfileImage()}
                                            alt="프로필"
                                            className="detail-profile-image"
                                        />
                                    ) : (
                                        <User className="detail-profile-icon" />
                                    )}
                                    <span className="detail-user-name">{getUserDisplayName()}</span>
                                </div>
                                <button className="detail-logout-btn" onClick={logout}>
                                    로그아웃
                                </button>
                            </div>
                        ) : (
                            <button className="detail-login-btn" onClick={handleLoginClick}>
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

            <div className="detail-container">
                {/* 종목 기본 정보 */}
                <div className="detail-stock-info-card">
                    <div className="detail-stock-basic-info">
                        <div className="detail-stock-title">
                            <h2>{stockData.name}</h2>
                            <span className="detail-stock-code">({stockData.code})</span>
                        </div>

                        <div className="detail-stock-price-info">
                            <div className="detail-current-price">
                                {formatPrice(stockData.price)}
                            </div>
                            <div className={`detail-price-change ${getChangeClass(stockData.change)}`}>
                                {getChangeIcon(stockData.change)}
                                <span>
                                    {stockData.change > 0 ? '+' : ''}{stockData.change}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 메인 콘텐츠 영역 */}
                <div className="detail-main-content">
                    {/* 차트 섹션 */}
                    <div className="detail-chart-section">
                        <div className="detail-chart-header">
                            <h3 className="detail-chart-title">차트</h3>
                            <div className="detail-chart-buttons">
                                <button
                                    className={selectedType === "time" ? "active" : ""}
                                    onClick={() => setSelectedType("time")}
                                >
                                    시간별
                                </button>
                                <button
                                    className={selectedType === "daily" ? "active" : ""}
                                    onClick={() => setSelectedType("daily")}
                                >
                                    일별
                                </button>
                                <button
                                    className={selectedType === "weekly" ? "active" : ""}
                                    onClick={() => setSelectedType("weekly")}
                                >
                                    주별
                                </button>
                                <button
                                    className={selectedType === "monthly" ? "active" : ""}
                                    onClick={() => setSelectedType("monthly")}
                                >
                                    월별
                                </button>
                                <button
                                    className={selectedType === "yearly" ? "active" : ""}
                                    onClick={() => setSelectedType("yearly")}
                                >
                                    년별
                                </button>
                            </div>
                        </div>
                        <div className="detail-stock-chart">
                            {renderChart()}
                        </div>
                    </div>

                    {/* 주문 패널 */}
                    <div className="detail-order-panel">
                        <div className="detail-order-header">
                            <h3>
                                주문하기
                                <div className="detail-order-type-tabs">
                                    <button
                                        className={`detail-order-type-tab ${orderType === 'buy' ? 'active buy' : ''}`}
                                        onClick={() => setOrderType('buy')}
                                    >
                                        구매
                                    </button>
                                    <button
                                        className={`detail-order-type-tab ${orderType === 'sell' ? 'active sell' : ''}`}
                                        onClick={() => setOrderType('sell')}
                                    >
                                        판매
                                    </button>
                                </div>
                            </h3>
                        </div>

                        {!isLoggedIn ? (
                            <div className="detail-order-login-required">
                                <div className="detail-order-form-group detail-price-group">
                                    <label>구매 가격</label>
                                    <div className="detail-price-type-buttons">
                                        <button
                                            className={`detail-price-type-btn ${priceType === '지정가' ? 'active' : ''}`}
                                            onClick={() => setPriceType('지정가')}
                                        >
                                            지정가
                                        </button>
                                        <button
                                            className={`detail-price-type-btn ${priceType === '시장가' ? 'active' : ''}`}
                                            onClick={() => setPriceType('시장가')}
                                        >
                                            시장가
                                        </button>
                                    </div>
                                </div>

                                <div className="detail-order-form-group detail-price-group">
                                    <div className="detail-price-input-container">
                                        <input
                                            type="text"
                                            className="detail-price-input"
                                            value={`${stockData.price.toLocaleString()} 원`}
                                            disabled
                                        />
                                        <div className="detail-price-controls">
                                            <button className="detail-price-control-btn" disabled>
                                                <Minus size={16} />
                                            </button>
                                            <button className="detail-price-control-btn" disabled>
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-order-form-group detail-quantity-group">
                                    <label>수량</label>
                                    <div className="detail-quantity-input-container">
                                        <input
                                            type="text"
                                            className="detail-quantity-input"
                                            value=""
                                            placeholder="수량 입력"
                                            disabled
                                        />
                                        <div className="detail-quantity-controls">
                                            <button className="detail-quantity-control-btn" disabled>
                                                <Minus size={16} />
                                            </button>
                                            <button className="detail-quantity-control-btn" disabled>
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-order-summary">
                                    <div className="detail-summary-row">
                                        <span>구매가능 금액</span>
                                        <span>0원</span>
                                    </div>
                                    <div className="detail-summary-row detail-total">
                                        <span>총 주문 금액</span>
                                        <span>{stockData.price.toLocaleString()}원</span>
                                    </div>
                                </div>

                                <button className={getOrderButtonClass()} onClick={handleLoginClick}>
                                    {getOrderButtonText()}
                                </button>
                            </div>
                        ) : (
                            <div className="detail-order-form">
                                <div className="detail-order-form-group detail-price-group">
                                    <label>구매 가격</label>
                                    <div className="detail-price-type-buttons">
                                        <button
                                            className={`detail-price-type-btn ${priceType === '지정가' ? 'active' : ''}`}
                                            onClick={() => setPriceType('지정가')}
                                        >
                                            지정가
                                        </button>
                                        <button
                                            className={`detail-price-type-btn ${priceType === '시장가' ? 'active' : ''}`}
                                            onClick={() => setPriceType('시장가')}
                                        >
                                            시장가
                                        </button>
                                    </div>
                                </div>

                                <div className="detail-order-form-group detail-price-group">
                                    <div className="detail-price-input-container">
                                        <input
                                            type="text"
                                            className="detail-price-input"
                                            value={priceType === '시장가' ? `${stockData.price.toLocaleString()} 원` : `${orderPrice} 원`}
                                            onChange={handlePriceChange}
                                            disabled={priceType === '시장가'}
                                            onKeyDown={(e) => {
                                                // 백스페이스나 Delete 키 처리
                                                if (e.key === 'Backspace') {
                                                    const currentValue = e.target.value;
                                                    const cursorPosition = e.target.selectionStart;

                                                    // 커서가 " 원" 부분에 있거나 그 바로 앞에 있을 때
                                                    if (cursorPosition >= currentValue.length - 2) {
                                                        e.preventDefault();
                                                        // 마지막 숫자 하나 제거
                                                        const cleanPrice = orderPrice.replace(/,/g, '');
                                                        const newPrice = cleanPrice.slice(0, -1);
                                                        if (newPrice === '') {
                                                            setOrderPrice('0');
                                                        } else {
                                                            setOrderPrice(parseInt(newPrice).toLocaleString());
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                        <div className="detail-price-controls">
                                            <button
                                                className="detail-price-control-btn"
                                                onClick={() => adjustPrice(-1)}
                                                disabled={priceType === '시장가'}
                                            >
                                                <Minus size={16}/>
                                            </button>
                                            <button
                                                className="detail-price-control-btn"
                                                onClick={() => adjustPrice(1)}
                                                disabled={priceType === '시장가'}
                                            >
                                                <Plus size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-order-form-group detail-quantity-group">
                                    <label>수량</label>
                                    <div className="detail-quantity-input-container">
                                        <input
                                            type="text"
                                            className="detail-quantity-input"
                                            value={orderQuantity ? `${orderQuantity} 주` : ''}
                                            onChange={handleQuantityChange}
                                            placeholder="수량 입력"
                                            onKeyDown={(e) => {
                                                // 백스페이스나 Delete 키 처리
                                                if (e.key === 'Backspace') {
                                                    const currentValue = e.target.value;
                                                    const cursorPosition = e.target.selectionStart;

                                                    // 커서가 " 주" 부분에 있거나 그 바로 앞에 있을 때
                                                    if (cursorPosition >= currentValue.length - 2) {
                                                        e.preventDefault();
                                                        // 마지막 숫자 하나 제거
                                                        const newQuantity = orderQuantity.slice(0, -1);
                                                        setOrderQuantity(newQuantity);
                                                    }
                                                }
                                            }}
                                        />
                                        <div className="detail-quantity-controls">
                                            <button
                                                className="detail-quantity-control-btn"
                                                onClick={() => adjustQuantity(-1)}
                                            >
                                                <Minus size={16}/>
                                            </button>
                                            <button
                                                className="detail-quantity-control-btn"
                                                onClick={() => adjustQuantity(1)}
                                            >
                                                <Plus size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-order-summary">
                                    <div className="detail-summary-row">
                                        <span>구매가능 금액</span>
                                        <span>{balance}</span>
                                    </div>
                                    <div className="detail-summary-row detail-total">
                                        <span>총 주문 금액</span>
                                        <span>{calculateTotalPrice().toLocaleString()}원</span>
                                    </div>
                                </div>

                                <button className={getOrderButtonClass()} onClick={handleOrder}>
                                    {getOrderButtonText()}
                                </button>

                                {/* 수량 입력 알림 토스트 */}
                                {showQuantityAlert && (
                                    <div className="detail-quantity-toast">
                                        <span className="detail-quantity-toast-icon">💡</span>
                                        <span className="detail-quantity-toast-message">수량을 입력하세요.</span>
                                        <button
                                            className="detail-quantity-toast-close"
                                            onClick={() => setShowQuantityAlert(false)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockDetailPage;

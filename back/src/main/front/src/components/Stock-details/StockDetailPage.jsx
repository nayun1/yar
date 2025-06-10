import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, User, Minus, Plus } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import LoginModal from '../common/LoginModal';
import KakaoAuth from '../../utils/KakaoAuth';
import StockSearch from "../Main/StockSearch";
import './StockDetailPage.css';

const StockDetailPage = () => {
    const { code } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // 주문 관련 상태
    const [orderType, setOrderType] = useState('buy'); // 'buy', 'sell', 'wait'
    const [priceType, setPriceType] = useState('지정가'); // '지정가', '시장가'
    const [orderPrice, setOrderPrice] = useState('');
    const [orderQuantity, setOrderQuantity] = useState(1);

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

    // 주식 데이터가 로드되면 주문 가격 초기화
    useEffect(() => {
        if (stockData && stockData.price) {
            setOrderPrice(stockData.price.toLocaleString());
        }
    }, [stockData]);

    const fetchStockDetail = async (stockCode) => {
        try {
            setLoading(true);
            // 실제 API 호출로 대체 필요
            // const response = await fetchStockDetail(stockCode);
            // setStockData(response);

            // 임시: API 응답이 없을 경우 에러 처리
            throw new Error('API 연결 필요');
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
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value) {
            setOrderPrice(parseInt(value).toLocaleString());
        } else {
            setOrderPrice('');
        }
    };

    const adjustPrice = (direction) => {
        const currentPrice = parseInt(orderPrice.replace(/,/g, '')) || 0;
        const tickSize = getTickSize(currentPrice);
        const increment = direction > 0 ? tickSize : -tickSize;
        const newPrice = Math.max(0, currentPrice + increment);
        setOrderPrice(newPrice.toLocaleString());
    };

    const handleQuantityChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value) {
            setOrderQuantity(parseInt(value));
        } else {
            setOrderQuantity(1);
        }
    };

    const adjustQuantity = (increment) => {
        const newQuantity = Math.max(1, orderQuantity + increment);
        setOrderQuantity(newQuantity);
    };

    const calculateTotalPrice = () => {
        const price = parseInt(orderPrice.replace(/,/g, '')) || 0;
        return price * orderQuantity;
    };

    const handleOrder = () => {
        if (!isLoggedIn) {
            setShowLoginModal(true);
            return;
        }

        // 주문 처리 로직
        console.log('주문 실행:', {
            orderType,
            priceType,
            price: parseInt(orderPrice.replace(/,/g, '')),
            quantity: orderQuantity,
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
        let baseClass = 'order-btn';
        if (!isLoggedIn) {
            baseClass += ' login-required';
        } else if (orderType === 'sell') {
            baseClass += ' sell';
        }
        return baseClass;
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
            <div className="header">
                <div className="header-content">
                    <div className="header-left">
                        <div className="logo">
                            <a href="/" className="logo-link">
                                <img src="/images/logo.png" alt="Young & Rich" className="main-logo-image"/>
                            </a>
                        </div>
                        <nav className="main-nav">
                            <a href="/" className="nav-item">홈</a>
                            <span className="nav-item">관심</span>
                            <a href="/my-assets" className="nav-item">내 자산</a>
                        </nav>
                    </div>
                    <div className="header-right">
                        <StockSearch/>

                        {authLoading ? (
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
                        </div>
                        <div className="detail-chart-placeholder">
                            📈 주식 차트가 여기에 표시됩니다
                        </div>
                    </div>

                    {/* 주문 패널 */}
                    <div className="order-panel">
                        <div className="order-header">
                            <h3>
                                주문하기
                                <div className="order-type-tabs">
                                    <button
                                        className={`order-type-tab ${orderType === 'buy' ? 'active buy' : ''}`}
                                        onClick={() => setOrderType('buy')}
                                    >
                                        구매
                                    </button>
                                    <button
                                        className={`order-type-tab ${orderType === 'sell' ? 'active sell' : ''}`}
                                        onClick={() => setOrderType('sell')}
                                    >
                                        판매
                                    </button>
                                </div>
                            </h3>
                        </div>

                        {!isLoggedIn ? (
                            <div className="order-login-required">
                                <div className="order-form-group price-group">
                                    <label>구매 가격</label>
                                    <div className="price-type-buttons">
                                        <button
                                            className={`price-type-btn ${priceType === '지정가' ? 'active' : ''}`}
                                            onClick={() => setPriceType('지정가')}
                                        >
                                            지정가
                                        </button>
                                        <button
                                            className={`price-type-btn ${priceType === '시장가' ? 'active' : ''}`}
                                            onClick={() => setPriceType('시장가')}
                                        >
                                            시장가
                                        </button>
                                    </div>
                                </div>

                                <div className="order-form-group price-group">
                                    <div className="price-input-container">
                                        <input
                                            type="text"
                                            className="price-input"
                                            value={`${stockData.price.toLocaleString()} 원`}
                                            disabled
                                        />
                                        <div className="price-controls">
                                            <button className="price-control-btn" disabled>
                                                <Minus size={16} />
                                            </button>
                                            <button className="price-control-btn" disabled>
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-form-group quantity-group">
                                    <label>수량</label>
                                    <div className="quantity-input-container">
                                        <input
                                            type="text"
                                            className="quantity-input"
                                            value={`${orderQuantity} 주`}
                                            onChange={handleQuantityChange}
                                            placeholder="수량"
                                        />
                                        <div className="quantity-controls">
                                            <button className="quantity-control-btn" disabled>
                                                <Minus size={16} />
                                            </button>
                                            <button className="quantity-control-btn" disabled>
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-summary">
                                    <div className="summary-row">
                                        <span>구매가능 금액</span>
                                        <span>0원</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>총 주문 금액</span>
                                        <span>{stockData.price.toLocaleString()}원</span>
                                    </div>
                                </div>

                                <button className={getOrderButtonClass()} onClick={handleLoginClick}>
                                    {getOrderButtonText()}
                                </button>
                            </div>
                        ) : (
                            <div className="order-form">
                                <div className="order-form-group price-group">
                                    <label>구매 가격</label>
                                    <div className="price-type-buttons">
                                        <button
                                            className={`price-type-btn ${priceType === '지정가' ? 'active' : ''}`}
                                            onClick={() => setPriceType('지정가')}
                                        >
                                            지정가
                                        </button>
                                        <button
                                            className={`price-type-btn ${priceType === '시장가' ? 'active' : ''}`}
                                            onClick={() => setPriceType('시장가')}
                                        >
                                            시장가
                                        </button>
                                    </div>
                                </div>

                                <div className="order-form-group price-group">
                                    <div className="price-input-container">
                                        <input
                                            type="text"
                                            className="price-input"
                                            value={`${orderPrice} 원`}
                                            onChange={handlePriceChange}
                                            disabled={priceType === '시장가'}
                                        />
                                        <div className="price-controls">
                                            <button
                                                className="price-control-btn"
                                                onClick={() => adjustPrice(-1)}
                                                disabled={priceType === '시장가'}
                                            >
                                                <Minus size={16}/>
                                            </button>
                                            <button
                                                className="price-control-btn"
                                                onClick={() => adjustPrice(1)}
                                                disabled={priceType === '시장가'}
                                            >
                                                <Plus size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-form-group quantity-group">
                                    <label>수량</label>
                                    <div className="quantity-input-container">
                                        <input
                                            type="text"
                                            className="quantity-input"
                                            value={`${orderQuantity} 주`}
                                            onChange={handleQuantityChange}
                                            placeholder="수량"
                                        />
                                        <div className="quantity-controls">
                                            <button
                                                className="quantity-control-btn"
                                                onClick={() => adjustQuantity(-1)}
                                            >
                                                <Minus size={16}/>
                                            </button>
                                            <button
                                                className="quantity-control-btn"
                                                onClick={() => adjustQuantity(1)}
                                            >
                                                <Plus size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-summary">
                                    <div className="summary-row">
                                        <span>구매가능 금액</span>
                                        <span>1,000,000원</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>총 주문 금액</span>
                                        <span>{calculateTotalPrice().toLocaleString()}원</span>
                                    </div>
                                </div>

                                <button className={getOrderButtonClass()} onClick={handleOrder}>
                                    {getOrderButtonText()}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockDetailPage;

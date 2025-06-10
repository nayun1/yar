<<<<<<< HEAD
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
=======
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
    const [priceType, setPriceType] = useState('지정가'); // '지정가', '시장가'
    const [orderPrice, setOrderPrice] = useState('59,700');
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
            // 여기서 개별 종목 API 호출
            // const response = await fetchStockDetail(stockCode);
            // setStockData(response);

            // 임시로 기본값 설정 (실제로는 API 응답 사용)
            setStockData({
                code: stockCode,
                name: '종목명 조회 중...',
                price: 59700,
                change: 2.5
            });
        } catch (error) {
            console.error('종목 상세 정보 조회 실패:', error);
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

    // 주문 관련 핸들러
    const handlePriceChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value) {
            setOrderPrice(parseInt(value).toLocaleString());
        } else {
            setOrderPrice('');
        }
    };

    const adjustPrice = (increment) => {
        const currentPrice = parseInt(orderPrice.replace(/,/g, '')) || 0;
        const newPrice = Math.max(0, currentPrice + increment);
        setOrderPrice(newPrice.toLocaleString());
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
            priceType,
            price: parseInt(orderPrice.replace(/,/g, '')),
            quantity: orderQuantity,
            total: calculateTotalPrice()
        });

        alert('주문이 접수되었습니다.');
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
                            <h3>주문하기</h3>
                        </div>

                        {!isLoggedIn ? (
                            <div className="order-login-required">
                                <div className="order-form-group price-group">
                                    <label>구매 가격</label>
                                    <div className="price-type-buttons">
                                        <button className="price-type-btn active" disabled>지정가</button>
                                        <button className="price-type-btn" disabled>시장가</button>
                                    </div>
                                </div>

                                <div className="order-form-group">
                                    <div className="price-input-container">
                                        <input
                                            type="text"
                                            className="price-input"
                                            value="59,700 원"
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

                                <div className="order-form-group">
                                    <label>수량</label>
                                    <div className="quantity-input-container">
                                        <input
                                            type="text"
                                            className="quantity-input"
                                            value="1 주"
                                            disabled
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
                                        <span>59,700원</span>
                                    </div>
                                </div>

                                <button className="order-btn login-required" onClick={handleLoginClick}>
                                    로그인하고 구매하기
                                </button>
                            </div>
                        ) : (
                            <div className="order-form">
                                <div className="order-form-group">
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

                                <div className="order-form-group price-input-group">
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
                                                onClick={() => adjustPrice(-100)}
                                                disabled={priceType === '시장가'}
                                            >
                                                <Minus size={16}/>
                                            </button>
                                            <button
                                                className="price-control-btn"
                                                onClick={() => adjustPrice(100)}
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
                                            readOnly
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

                                <button className="order-btn" onClick={handleOrder}>
                                    주문하기
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
>>>>>>> kimnayoon
        </div>
    );
};

export default StockDetailPage;

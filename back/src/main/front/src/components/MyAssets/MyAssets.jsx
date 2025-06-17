// src/components/MyAssets/MyAssets.jsx
import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, Info } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import LoginModal from '../common/LoginModal';
import KakaoAuth from '../../utils/KakaoAuth';
import './MyAssets.css';

const MyAssets = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [activeTab, setActiveTab] = useState('assets'); // 'assets', 'holdings'

    // 인증 상태 관리
    const { isLoggedIn, userInfo, loading, logout } = useAuth();

    // 보유종목 더미 데이터 (실제로는 API에서 가져올 데이터)
    const holdingsData = [
        {
            name: 'SK하이닉스',
            quantity: 50,
            currentPrice: 125000,
            avgPrice: 130000
        },
        {
            name: '삼성전자',
            quantity: 80,
            currentPrice: 71200,
            avgPrice: 70000
        },
        {
            name: '카카오',
            quantity: 30,
            currentPrice: 48650,
            avgPrice: 52000
        },
        {
            name: '네이버',
            quantity: 25,
            currentPrice: 189500,
            avgPrice: 185000
        },
        {
            name: 'LG화학',
            quantity: 15,
            currentPrice: 392000,
            avgPrice: 400000
        },
        {
            name: '셀트리온',
            quantity: 40,
            currentPrice: 178500,
            avgPrice: 175000
        },
        {
            name: '현대차',
            quantity: 35,
            currentPrice: 168000,
            avgPrice: 170000
        },
        {
            name: 'POSCO홀딩스',
            quantity: 20,
            currentPrice: 298500,
            avgPrice: 290000
        },
        {
            name: 'KB금융',
            quantity: 60,
            currentPrice: 52800,
            avgPrice: 52800
        },
        {
            name: '크래프톤',
            quantity: 12,
            currentPrice: 234000,
            avgPrice: 240000
        }
    ];

    // 실시간 시간 업데이트
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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

    // 탭별 콘텐츠 렌더링
    const renderTabContent = () => {
        switch(activeTab) {
            case 'assets':
                return (
                    <>
                        {/* 총 자산 섹션 */}
                        <div className="total-assets-section">
                            <h3 className="assets-section-title">총 자산</h3>
                            <div className="total-assets-amount">52,450,000원</div>
                            <div className="total-assets-change positive">+2,450,000원 (+4.9%)</div>
                        </div>

                        {/* 포트폴리오 카드 그리드 */}
                        <div className="portfolio-grid">
                            {/* 주문 가능 금액 카드 */}
                            <div className="portfolio-card">
                                <h3 className="card-section-title">주문 가능 금액</h3>
                                <div className="card-content">
                                    <div className="card-details">
                                        <div className="card-label">원화</div>
                                        <div className="card-amount">2,450,000원</div>
                                    </div>
                                </div>
                            </div>

                            {/* 투자중인 금액 카드 */}
                            <div className="portfolio-card">
                                <h3 className="card-section-title">투자중인 금액</h3>
                                <div className="card-content">
                                    <div className="card-details">
                                        <div className="card-label">주식</div>
                                        <div className="card-amount">50,000,000원</div>
                                        <div className="card-change positive">+5,000,000원 (+11.1%)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );

            case 'holdings':
                return (
                    <div className="holdings-section">
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
                                const totalProfitPercent = ((totalProfit / totalInvestment) * 100);

                                return (
                                    <div key={index} className="holdings-table-row">
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

                {/* 로그인 안내 메시지 추가 */}
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

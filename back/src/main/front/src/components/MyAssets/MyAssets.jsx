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
    const [activeTab, setActiveTab] = useState('assets'); // 'assets' 또는 'transactions'

    // 인증 상태 관리
    const { isLoggedIn, userInfo, loading, logout } = useAuth();

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
                            className={`sidebar-menu-item ${activeTab === 'transactions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('transactions')}
                        >
                            거래내역
                        </button>
                    </div>
                </div>

                {/* 메인 콘텐츠 영역 */}
                <div className="assets-main">
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
                </div>
            </div>
        </div>
    );
};

export default MyAssets;

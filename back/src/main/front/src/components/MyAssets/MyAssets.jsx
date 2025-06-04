// src/components/MyAssets/MyAssets.jsx
import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, Info } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import LoginModal from '../common/LoginModal';
import KakaoAuth from '../../utils/KakaoAuth';
import './MyAssets.css';

// 포트폴리오 차트 컴포넌트
const PortfolioChart = () => {
    const canvasRef = useRef(null);
    const [hoverData, setHoverData] = useState(null);
    const [activeTimeframe, setActiveTimeframe] = useState('1주');

    // 샘플 데이터 (실제로는 API에서 가져올 데이터)
    const sampleData = {
        '1주': [
            { date: '2025.05.19', value: 11200000, return: 1.8 },
            { date: '2025.05.20', value: 10800000, return: -2.0 },
            { date: '2025.05.21', value: 11500000, return: 4.5 },
            { date: '2025.05.22', value: 10429604, return: -5.2 },
            { date: '2025.05.23', value: 10100000, return: -8.2 },
            { date: '2025.05.24', value: 10200000, return: -7.3 },
            { date: '2025.05.25', value: 10279004, return: -7.5 }
        ],
        '1달': [
            { date: '2025.04.25', value: 11000000, return: 0 },
            { date: '2025.05.02', value: 11300000, return: 2.7 },
            { date: '2025.05.09', value: 10900000, return: -0.9 },
            { date: '2025.05.16', value: 11100000, return: 0.9 },
            { date: '2025.05.22', value: 10429604, return: -5.2 },
            { date: '2025.05.25', value: 10279004, return: -7.5 }
        ],
        '3달': [
            { date: '2025.02.25', value: 11000000, return: 0 },
            { date: '2025.03.15', value: 11800000, return: 7.3 },
            { date: '2025.04.05', value: 11200000, return: 1.8 },
            { date: '2025.04.25', value: 10800000, return: -1.8 },
            { date: '2025.05.15', value: 10600000, return: -3.6 },
            { date: '2025.05.25', value: 10279004, return: -7.5 }
        ],
        '1년': [
            { date: '2024.05.25', value: 11000000, return: 0 },
            { date: '2024.08.25', value: 12000000, return: 9.1 },
            { date: '2024.11.25', value: 11500000, return: 4.5 },
            { date: '2025.02.25', value: 11200000, return: 1.8 },
            { date: '2025.05.25', value: 10279004, return: -7.5 }
        ]
    };

    const currentData = sampleData[activeTimeframe];
    const currentValue = currentData[currentData.length - 1];
    const displayData = hoverData || currentValue;

    // Canvas 그래프 그리기 함수
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        // 고해상도 디스플레이 지원
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const padding = { top: 20, right: 50, bottom: 20, left: 50 };

        // 배경 지우기
        ctx.clearRect(0, 0, width, height);

        if (currentData.length === 0) return;

        // 데이터 값 범위 계산
        const values = currentData.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const valueRange = maxValue - minValue;

        // 좌표 변환 함수
        const getX = (index) => padding.left + (index / (currentData.length - 1)) * (width - padding.left - padding.right);
        const getY = (value) => padding.top + (1 - (value - minValue) / valueRange) * (height - padding.top - padding.bottom);

        // 그라데이션 영역 채우기
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

        ctx.beginPath();
        ctx.moveTo(getX(0), getY(currentData[0].value));

        for (let i = 1; i < currentData.length; i++) {
            ctx.lineTo(getX(i), getY(currentData[i].value));
        }

        ctx.lineTo(getX(currentData.length - 1), height - padding.bottom);
        ctx.lineTo(getX(0), height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // 라인 그래프 그리기
        ctx.beginPath();
        ctx.moveTo(getX(0), getY(currentData[0].value));

        for (let i = 1; i < currentData.length; i++) {
            ctx.lineTo(getX(i), getY(currentData[i].value));
        }

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 호버 시 수직선과 포인트 그리기
        if (hoverData) {
            const hoverIndex = currentData.findIndex(d => d.date === hoverData.date);
            if (hoverIndex !== -1) {
                const x = getX(hoverIndex);
                const y = getY(hoverData.value);

                // 수직 가이드라인
                ctx.beginPath();
                ctx.moveTo(x, padding.top);
                ctx.lineTo(x, height - padding.bottom);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.setLineDash([]);

                // 호버 포인트
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

    }, [currentData, hoverData]);

    // 마우스 이벤트 핸들러
    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const padding = { left: 50, right: 50 };

        // 마우스 위치에서 가장 가까운 데이터 포인트 찾기
        const dataWidth = width - padding.left - padding.right;
        const relativeX = x - padding.left;
        const index = Math.round((relativeX / dataWidth) * (currentData.length - 1));

        if (index >= 0 && index < currentData.length) {
            setHoverData(currentData[index]);
        }
    };

    const handleMouseLeave = () => {
        setHoverData(null);
    };

    // 숫자 포맷팅 함수
    const formatNumber = (num) => {
        return num.toLocaleString('ko-KR');
    };

    const formatReturn = (returnValue) => {
        const sign = returnValue >= 0 ? '+' : '';
        return `${sign}${returnValue.toFixed(1)}%`;
    };

    return (
        <div style={{
            backgroundColor: '#2a2a2a',
            color: 'white',
            padding: '24px',
            borderRadius: '12px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            marginBottom: '40px'
        }}>
            {/* 포트폴리오 값 표시 헤더 */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    letterSpacing: '-0.5px'
                }}>
                    {formatNumber(displayData.value)}원
                </div>
                <div style={{
                    fontSize: '16px',
                    color: displayData.return >= 0 ? '#10b981' : '#4a9eff',
                    fontWeight: '500'
                }}>
                    지난주부터 {displayData.return >= 0 ? '+' : ''}{formatNumber(Math.abs(Math.round(displayData.value - 11000000)))}원 ({formatReturn(displayData.return)})
                </div>
            </div>

            {/* 그래프 영역 */}
            <div style={{ position: 'relative', marginBottom: '24px' }}>
                <canvas
                    ref={canvasRef}
                    style={{
                        width: '100%',
                        height: '200px',
                        cursor: 'crosshair'
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                />

                {/* 호버 툴팁 */}
                {hoverData && (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        backgroundColor: 'rgba(42, 42, 42, 0.95)',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        border: '1px solid #3a3a3a',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ color: '#888', marginBottom: '4px' }}>
                            {hoverData.date}
                        </div>
                        <div style={{ fontWeight: '600' }}>
                            {formatNumber(hoverData.value)}원
                        </div>
                    </div>
                )}
            </div>

            {/* 시간 프레임 선택 버튼들 */}
            <div style={{
                display: 'flex',
                gap: '8px'
            }}>
                {Object.keys(sampleData).map((timeframe) => (
                    <button
                        key={timeframe}
                        onClick={() => setActiveTimeframe(timeframe)}
                        style={{
                            backgroundColor: activeTimeframe === timeframe ? '#3a3a3a' : 'transparent',
                            color: activeTimeframe === timeframe ? '#fff' : '#888',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (activeTimeframe !== timeframe) {
                                e.target.style.backgroundColor = '#2a2a2a';
                                e.target.style.color = '#fff';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeTimeframe !== timeframe) {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#888';
                            }
                        }}
                    >
                        {timeframe}
                    </button>
                ))}
            </div>
        </div>
    );
};

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
                                <span className="assets-nav-item">뉴스</span>
                                <span className="assets-nav-item">관심</span>
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
                            <span className="assets-nav-item">관심</span>
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
                        <div className="asset-item-detail">
                            <div className="asset-amount">50,000,000원</div>
                        </div>
                    </div>

                    {/* 포트폴리오 수익률 그래프 */}
                    <PortfolioChart />

                    {/* 주문 가능 금액 섹션 */}
                    <div className="order-available-section">
                        <h3 className="assets-section-title">주문 가능 금액</h3>

                        <div className="order-amounts">
                            <div className="order-item">
                                <div className="order-item-content">
                                    <div className="order-icon">
                                        <div className="currency-icon">₩</div>
                                    </div>
                                    <div className="order-details">
                                        <div className="order-label">원화</div>
                                        <div className="order-amount">0원</div>
                                    </div>
                                </div>
                            </div>

                            <div className="order-item">
                                <div className="order-item-content">
                                    <div className="order-icon">
                                        <div className="currency-icon dollar">$</div>
                                    </div>
                                    <div className="order-details">
                                        <div className="order-label">달러</div>
                                        <div className="order-amount">$0.00</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 투자중인 금액 섹션 */}
                    <div className="investment-section">
                        <h3 className="section-title">투자중인 금액</h3>
                        <div className="investment-total">
                            50,000,000원 <span className="total-change negative">(+10.0%)</span>
                        </div>

                        <div className="investment-breakdown">
                            <div className="investment-item">
                                <div className="investment-item-content">
                                    <div className="investment-flag">🇰🇷</div>
                                    <div className="investment-info">
                                        <div className="investment-label">국내주식</div>
                                        <div className="investment-value">0원</div>
                                        <div className="investment-change">0원 (0.0%)</div>
                                    </div>
                                </div>
                            </div>

                            <div className="investment-item">
                                <div className="investment-item-content">
                                    <div className="investment-flag">🇺🇸</div>
                                    <div className="investment-info">
                                        <div className="investment-label">해외주식</div>
                                        <div className="investment-value">
                                            50,000,000원 <span className="dollar-value">$36,610.30</span>
                                        </div>
                                        <div className="investment-change negative">+5,000,000원 (+10.0%)</div>
                                    </div>
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
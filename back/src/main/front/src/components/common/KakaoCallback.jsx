import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import KakaoAuth from '../../utils/KakaoAuth';

const KakaoCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleKakaoCallback = async () => {
            try {
                const code = searchParams.get('code');
                const error = searchParams.get('error');

                if (error) {
                    throw new Error('카카오 로그인이 취소되었습니다.');
                }

                if (!code) {
                    throw new Error('인가 코드가 없습니다.');
                }

                // 액세스 토큰 받기
                await KakaoAuth.getAccessToken(code);

                // 사용자 정보 가져오기
                const userInfo = await KakaoAuth.getUserInfo();

                // 사용자 정보 저장
                KakaoAuth.setStoredUserInfo(userInfo);

                // 메인 페이지로 리다이렉트
                navigate('/', { replace: true });

            } catch (error) {
                console.error('카카오 로그인 처리 오류:', error);
                setError(error.message);
                setLoading(false);

                // 3초 후 메인 페이지로 리다이렉트
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 3000);
            }
        };

        handleKakaoCallback();
    }, [searchParams, navigate]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#1a1a1a',
                color: 'white',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #3a3a3a',
                    borderTop: '4px solid #4285f4',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p>카카오 로그인 처리 중...</p>
                <style>
                    {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
                </style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#1a1a1a',
                color: 'white',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <p style={{ color: '#ff4444' }}>로그인 오류: {error}</p>
                <p style={{ color: '#888' }}>3초 후 메인 페이지로 이동합니다...</p>
            </div>
        );
    }

    return null;
};

export default KakaoCallback;
import { useState, useEffect } from 'react';
import KakaoAuth from '../utils/KakaoAuth';

const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const loggedIn = KakaoAuth.isLoggedIn();
                setIsLoggedIn(loggedIn);

                if (loggedIn) {
                    let storedUserInfo = KakaoAuth.getStoredUserInfo();

                    // 저장된 사용자 정보가 없으면 API에서 다시 가져오기
                    if (!storedUserInfo) {
                        try {
                            storedUserInfo = await KakaoAuth.getUserInfo();
                            KakaoAuth.setStoredUserInfo(storedUserInfo);
                        } catch (error) {
                            console.error('사용자 정보 조회 실패:', error);
                            // 토큰이 만료되었을 수 있으므로 로그아웃 처리
                            await handleLogout();
                            return;
                        }
                    }

                    setUserInfo(storedUserInfo);
                }
            } catch (error) {
                console.error('인증 상태 확인 오류:', error);
                setIsLoggedIn(false);
                setUserInfo(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const handleLogin = () => {
        KakaoAuth.login();
    };

    const handleLogout = async () => {
        try {
            await KakaoAuth.logout();
            setIsLoggedIn(false);
            setUserInfo(null);
        } catch (error) {
            console.error('로그아웃 오류:', error);
        }
    };

    return {
        isLoggedIn,
        userInfo,
        loading,
        login: handleLogin,
        logout: handleLogout
    };
};

export default useAuth;
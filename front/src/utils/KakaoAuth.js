class KakaoAuth {
    constructor() {
        this.REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY;
        this.REDIRECT_URI = process.env.REACT_APP_KAKAO_REDIRECT_URI;
        this.KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${this.REST_API_KEY}&redirect_uri=${this.REDIRECT_URI}&response_type=code&scope=profile_nickname,profile_image&prompt=login`;
    }

    // 카카오 로그인 페이지로 리다이렉트
    login() {
        window.location.href = this.KAKAO_AUTH_URL;
    }

    // 인가 코드로 액세스 토큰 받기
    async getAccessToken(code) {
        try {
            const response = await fetch('https://kauth.kakao.com/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: this.REST_API_KEY,
                    redirect_uri: this.REDIRECT_URI,
                    code: code
                })
            });

            const data = await response.json();

            if (data.access_token) {
                // 토큰을 localStorage에 저장
                localStorage.setItem('kakao_access_token', data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem('kakao_refresh_token', data.refresh_token);
                }
                return data;
            } else {
                throw new Error('토큰 발급 실패');
            }
        } catch (error) {
            console.error('카카오 토큰 발급 오류:', error);
            throw error;
        }
    }

    // 사용자 정보 가져오기
    async getUserInfo() {
        const accessToken = localStorage.getItem('kakao_access_token');

        if (!accessToken) {
            throw new Error('액세스 토큰이 없습니다.');
        }

        try {
            const response = await fetch('https://kapi.kakao.com/v2/user/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                }
            });

            const data = await response.json();

            if (data.id) {
                return data;
            } else {
                throw new Error('사용자 정보 조회 실패');
            }
        } catch (error) {
            console.error('사용자 정보 조회 오류:', error);
            throw error;
        }
    }

    // 로그아웃
    async logout() {
        const accessToken = localStorage.getItem('kakao_access_token');

        if (accessToken) {
            try {
                await fetch('https://kapi.kakao.com/v1/user/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                    }
                });
            } catch (error) {
                console.error('카카오 로그아웃 오류:', error);
            }
        }

        // 로컬 스토리지에서 토큰 제거
        localStorage.removeItem('kakao_access_token');
        localStorage.removeItem('kakao_refresh_token');
        localStorage.removeItem('user_info');
    }

    // 로그인 상태 확인
    isLoggedIn() {
        return !!localStorage.getItem('kakao_access_token');
    }

    // 저장된 사용자 정보 가져오기
    getStoredUserInfo() {
        const userInfo = localStorage.getItem('user_info');
        return userInfo ? JSON.parse(userInfo) : null;
    }

    // 사용자 정보 저장
    setStoredUserInfo(userInfo) {
        localStorage.setItem('user_info', JSON.stringify(userInfo));
    }
}

export default new KakaoAuth();
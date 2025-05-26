// src/components/common/LoginModal.jsx
import React from 'react';
import { X } from 'lucide-react';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onKakaoLogin }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKakaoLogin = () => {
        onKakaoLogin();
        onClose();
    };

    return (
        <div className="login-modal-overlay" onClick={handleOverlayClick}>
            <div className="login-modal">
                <div className="login-modal-header">
                    <h2 className="login-modal-title">로그인</h2>
                    <button className="login-modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="login-modal-content">
                    <p className="login-modal-description">
                        Young & Rich에 로그인하여 더 많은 기능을 이용하세요
                    </p>

                    <div className="login-options">
                        <button className="kakao-login-btn" onClick={handleKakaoLogin}>
                            <div className="kakao-icon">💬</div>
                            카카오로 로그인
                        </button>
                    </div>

                    <div className="login-footer">
                        <p className="login-terms">
                            로그인하면 <span className="terms-link">서비스 약관</span> 및 <span className="terms-link">개인정보 처리방침</span>에 동의한 것으로 간주됩니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
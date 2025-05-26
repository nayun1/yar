// src/App.js 수정
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StockTradingMain from './components/Main/StockTradingMain';
import MyAssets from './components/MyAssets/MyAssets';
import KakaoCallback from './components/common/KakaoCallback';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<StockTradingMain />} />
                    <Route path="/my-assets" element={<MyAssets />} />
                    <Route path="/oauth/callback/kakao" element={<KakaoCallback />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
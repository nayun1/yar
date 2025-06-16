// src/context/TradeContext.js
import { createContext, useState, useEffect } from 'react';

export const TradeContext = createContext();
//전역 공유 Context 생성

//TradeProvider 컴포넌트 거래 관령 상태 관리 하위 컴포넌트에 공급
export const TradeProvider = ({ children }) => {
    const [balance, setBalance] = useState(() => {
        const saved = localStorage.getItem('balance');
        return saved ? JSON.parse(saved) : 50000000;
    });

    const [stocks, setStocks] = useState(() => {
        const saved = localStorage.getItem('stocks');
        return saved ? JSON.parse(saved) : {};
    });

    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('history');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('balance', JSON.stringify(balance));
        localStorage.setItem('stocks', JSON.stringify(stocks));
        localStorage.setItem('history', JSON.stringify(history));
    }, [balance, stocks, history]);

    const buyStock = (stockCode, price, quantity) => {
        const cost = price * quantity;
        if (balance < cost) return false;

        setBalance(balance - cost);
        setStocks((prev) => ({
            ...prev,
            [stockCode]: (prev[stockCode] || 0) + quantity,
        }));
        setHistory((prev) => [
            ...prev,
            { type: 'BUY', stockCode, price, quantity, date: new Date() },
        ]);
        return true;
    };

    const sellStock = (stockCode, price, quantity) => {
        if (!stocks[stockCode] || stocks[stockCode] < quantity) return false;

        setBalance(balance + price * quantity);
        setStocks((prev) => ({
            ...prev,
            [stockCode]: prev[stockCode] - quantity,
        }));
        setHistory((prev) => [
            ...prev,
            { type: 'SELL', stockCode, price, quantity, date: new Date() },
        ]);
        return true;
    };

    return (
        <TradeContext.Provider value={{
            balance, stocks, history,
            buyStock, sellStock,
        }}>
            {children}
        </TradeContext.Provider>
    );
};

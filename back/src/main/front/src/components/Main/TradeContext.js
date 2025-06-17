// src/components/Main/TradeContext.js
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
        setStocks((prev) => {
            const currentStock = prev[stockCode] || { quantity: 0, totalPrice: 0 };
            const newQuantity = currentStock.quantity + quantity;
            const newTotalPrice = currentStock.totalPrice + cost;

            return {
                ...prev,
                [stockCode]: {
                    quantity: newQuantity,
                    totalPrice: newTotalPrice,
                    averagePrice: Math.round(newTotalPrice / newQuantity)
                }
            };
        });
        setHistory((prev) => [
            ...prev,
            { type: 'BUY', stockCode, price, quantity, date: new Date() },
        ]);
        return true;
    };

    const sellStock = (stockCode, price, quantity) => {
        if (!stocks[stockCode] || stocks[stockCode].quantity < quantity) return false;

        setBalance(balance + price * quantity);
        setStocks((prev) => {
            const currentStock = prev[stockCode];
            const newQuantity = currentStock.quantity - quantity;

            if (newQuantity === 0) {
                // 수량이 0이 되면 해당 주식 정보 삭제
                const newStocks = { ...prev };
                delete newStocks[stockCode];
                return newStocks;
            }

            // 수량이 남아있으면 평균 매수가는 유지
            return {
                ...prev,
                [stockCode]: {
                    quantity: newQuantity,
                    totalPrice: currentStock.averagePrice * newQuantity,
                    averagePrice: currentStock.averagePrice
                }
            };
        });
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

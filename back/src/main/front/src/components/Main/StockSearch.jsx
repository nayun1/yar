import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StockSearch.css';

const StockSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const searchRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const navigate = useNavigate();

    // 시장 타입별 아이콘
    const getMarketIcon = (marketType) => {
        if (!marketType) return "❓";

        switch (marketType.trim()) {
            case "유가증권":
            case "유가증권시장":
                return "🏛️";
            case "코스닥":
                return "🟡";
            case "코넥스":
                return "🟢";
            case "ETF":
                return "📈";
            case "ETN":
                return "📊";
            case "ELW":
                return "💎";
            default:
                return "❓";
        }
    };

    // 최근 검색어 불러오기
    useEffect(() => {
        const savedSearches = localStorage.getItem('recentStockSearches');
        if (savedSearches) {
            setRecentSearches(JSON.parse(savedSearches));
        }
    }, []);

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 컴포넌트 언마운트 시 타이머 정리
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // 검색 API 호출
    const handleSearch = async (searchQuery = query) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        try {
            const res = await axios.get(`/api/stocks/search`, {
                params: { name: searchQuery }
            });
            setResults(res.data);
        } catch (error) {
            console.error("검색 에러:", error);
            setResults([]);
        }
    };

    // 디바운스된 검색
    const debouncedSearch = useCallback((searchQuery) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            handleSearch(searchQuery);
        }, 300);
    }, []);

    // 최근 검색어 추가
    const addToRecentSearches = (searchTerm) => {
        const newRecentSearches = [
            searchTerm,
            ...recentSearches.filter(item => item !== searchTerm)
        ].slice(0, 5);

        setRecentSearches(newRecentSearches);
        localStorage.setItem('recentStockSearches', JSON.stringify(newRecentSearches));
    };

    // 입력값 변경 처리
    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.trim()) {
            debouncedSearch(value);
        } else {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            setResults([]);
        }
    };

    // 검색바 클릭
    const handleInputClick = () => {
        setIsOpen(true);
    };

    // 최근 검색어 클릭
    const handleRecentSearchClick = (searchTerm) => {
        setQuery(searchTerm);
        handleSearch(searchTerm);
    };

    // 엔터키 처리
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            handleSearch(query);
        }
    };

    // 검색어 하이라이트
    const highlightSearchTerm = (text, searchTerm) => {
        if (!searchTerm) return text;

        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ?
                <span key={index} style={{ color: '#4A90E2', fontWeight: 'bold' }}>{part}</span> :
                part
        );
    };

    // 주식 항목 클릭 - 상세 페이지로 이동
    const handleStockClick = (stock) => {
        setQuery(stock.companyName);
        setIsOpen(false);
        addToRecentSearches(stock.companyName);
        navigate(`/stock/${stock.stockCode}`);
    };

    // 최근 검색어 전체 삭제
    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentStockSearches');
    };

    // 개별 최근 검색어 삭제
    const removeRecentSearch = (indexToRemove, e) => {
        e.stopPropagation();
        const newRecentSearches = recentSearches.filter((_, index) => index !== indexToRemove);
        setRecentSearches(newRecentSearches);
        localStorage.setItem('recentStockSearches', JSON.stringify(newRecentSearches));
    };

    return (
        <div className="stock-search-container" ref={searchRef}>
            <div className="search-input-wrapper">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onClick={handleInputClick}
                    onKeyPress={handleKeyPress}
                    placeholder="종목명을 입력하세요"
                    className="search-input"
                />
            </div>

            {isOpen && (
                <div className="search-dropdown">
                    {/* 최근 검색 섹션 */}
                    {recentSearches.length > 0 && (
                        <div className="recent-searches-section">
                            <div className="section-header">
                                <span className="section-title">최근 검색</span>
                                <button
                                    className="clear-button"
                                    onClick={clearRecentSearches}
                                >
                                    전체 삭제
                                </button>
                            </div>
                            <div className="recent-searches-list">
                                {recentSearches.map((search, index) => (
                                    <div
                                        key={index}
                                        className="recent-search-item"
                                        onClick={() => handleRecentSearchClick(search)}
                                    >
                                        <span className="search-text">{search}</span>
                                        <button
                                            className="remove-search-btn"
                                            onClick={(e) => removeRecentSearch(index, e)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 검색 결과 섹션 */}
                    {query && results.length > 0 && (
                        <div className="search-results-section">
                            <div className="section-header">
                                <span className="section-title">종목</span>
                            </div>
                            <div className="search-results-list">
                                {results.map((stock, index) => (
                                    <div
                                        key={index}
                                        className="search-result-item"
                                        onClick={() => handleStockClick(stock)}
                                    >
                                        <div className="search-stock-icon">
                                            {getMarketIcon(stock.marketType)}
                                        </div>
                                        <div className="search-stock-info">
                                            <div className="search-stock-name">
                                                {highlightSearchTerm(stock.companyName, query)}
                                            </div>
                                            <div className="search-stock-code">{stock.stockCode}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 검색 결과 없음 */}
                    {query && results.length === 0 && (
                        <div className="no-results">
                            <span>검색 결과가 없습니다.</span>
                        </div>
                    )}

                    {/* 초기 상태 */}
                    {!query && recentSearches.length === 0 && (
                        <div className="empty-state">
                            <span>종목명을 입력하세요</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StockSearch;

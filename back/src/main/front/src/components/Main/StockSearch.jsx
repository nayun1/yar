//StockSearch.jsx
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
    const navigate = useNavigate();

    // 디바운싱을 위한 타이머 ref
    const searchTimeoutRef = useRef(null);

    // 시장 타입에 따른 아이콘 매핑 함수 추가
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

    // 컴포넌트 마운트 시 최근 검색어 불러오기
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
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 검색 실행 (최근 검색어에 저장하지 않음)
    const handleSearch = async (searchQuery = query) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        try {
            const res = await axios.get(`/api/stocks/search`, {
                params: { name: searchQuery }
            });

            console.log("검색 결과:", res.data);
            setResults(res.data);

        } catch (error) {
            console.error("검색 에러:", error);
        }
    };

    // 디바운스된 검색 함수
    const debouncedSearch = useCallback((searchQuery) => {
        // 기존 타이머 클리어
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // 새로운 타이머 설정 (500ms 후 검색 실행)
        searchTimeoutRef.current = setTimeout(() => {
            handleSearch(searchQuery);
        }, 500); // 500ms 대기
    }, []);

    // 최근 검색어에 추가하는 별도 함수
    const addToRecentSearches = (searchTerm) => {
        const newRecentSearches = [
            searchTerm,
            ...recentSearches.filter(item => item !== searchTerm)
        ].slice(0, 5);

        setRecentSearches(newRecentSearches);
        localStorage.setItem('recentStockSearches', JSON.stringify(newRecentSearches));
    };

    // 입력값 변경 시 디바운스된 검색
    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.trim()) {
            // 즉시 검색하지 않고 디바운스된 검색 사용
            debouncedSearch(value);
        } else {
            // 기존 타이머 클리어
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
        // 즉시 검색 (디바운싱 없이)
        handleSearch(searchTerm);
    };

    // 엔터키 처리 (즉시 검색)
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            // 기존 타이머 클리어하고 즉시 검색
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            handleSearch(query);
        }
    };

    // 검색어 하이라이트 함수
    const highlightSearchTerm = (text, searchTerm) => {
        if (!searchTerm) return text;

        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ?
                <span key={index} style={{ color: '#4A90E2' }}>{part}</span> :
                part
        );
    };

    // 주식 항목 클릭 (상세 페이지로 이동 추가)
    const handleStockClick = (stock) => {
        console.log("선택된 주식:", stock);
        setQuery(stock.companyName);
        setIsOpen(false);

        // 선택된 주식만 최근 검색어에 추가
        addToRecentSearches(stock.companyName);

        // 상세 페이지로 이동
        navigate(`/stock/${stock.stockCode}`);
    };

    // 최근 검색어 삭제
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

    // 컴포넌트 언마운트 시 타이머 정리
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

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

                    {/* 종목 섹션 */}
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
                                        <div className="search-stock-icon">{getMarketIcon(stock.marketType)}</div>
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

                    {/* 초기 상태 (검색어 없고 최근 검색도 없음) */}
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

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './StockSearch.css';

const StockSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const searchRef = useRef(null);

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
        if (!searchQuery.trim()) return;

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

    // 최근 검색어에 추가하는 별도 함수
    const addToRecentSearches = (searchTerm) => {
        const newRecentSearches = [
            searchTerm,
            ...recentSearches.filter(item => item !== searchTerm)
        ].slice(0, 5); // 최대 5개까지만 저장

        setRecentSearches(newRecentSearches);
        localStorage.setItem('recentStockSearches', JSON.stringify(newRecentSearches));
    };

    // 입력값 변경 시 실시간 검색
    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.trim()) {
            handleSearch(value);
        } else {
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

    // 주식 항목 클릭 (최근 검색어에 추가)
    const handleStockClick = (stock) => {
        console.log("선택된 주식:", stock);
        setQuery(stock.companyName);
        setIsOpen(false);

        // 선택된 주식만 최근 검색어에 추가
        addToRecentSearches(stock.companyName);

        // 여기에 주식 선택 후 동작 추가 (예: 상세 페이지 이동 등)
    };

    // 최근 검색어 삭제
    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentStockSearches');
    };

    // 개별 최근 검색어 삭제
    const removeRecentSearch = (indexToRemove, e) => {
        e.stopPropagation(); // 클릭 이벤트 버블링 방지
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
                                        <div className="search-stock-icon">📈</div>
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
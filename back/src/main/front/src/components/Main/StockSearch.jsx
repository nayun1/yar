import React, { useState } from 'react';
import axios from 'axios';

const StockSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = async () => {
        try {
            const res = await axios.get(`/api/stocks/search`, {
                params: { name: query }
            });

            console.log("검색 결과:", res.data);  // ✅ 여기에 결과 출력!
            setResults(res.data);
        } catch (error) {
            console.error("검색 에러:", error);
        }
    };

    return (
        <div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="종목명을 입력하세요"
            />
            <button onClick={handleSearch}>검색</button>

            <ul>
                {results.map((stock, index) => (
                    <li key={index}>
                        {stock.companyName} - {stock.stockCode}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StockSearch;

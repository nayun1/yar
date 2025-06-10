import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TimeCandleChart = ({ stockCode }) => {
    const [candleData, setCandleData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCandleData = async () => {
            try {
                setLoading(true);
                console.log('API 호출 시작:', `/time/stocks/daily-time-candles?stockCode=${stockCode}`);
                const response = await axios.get(`/time/stocks/daily-time-candles?stockCode=${stockCode}`);
                console.log('받은 데이터:', response.data);
                setCandleData(response.data);
                setError(null);
            } catch (err) {
                console.error('캔들 데이터 로딩 실패:', err);
                console.error('에러 상세:', err.response ? err.response.data : err.message);
                setError('데이터를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchCandleData();
        // 1분마다 데이터 갱신
        const interval = setInterval(fetchCandleData, 60000);
        return () => clearInterval(interval);
    }, [stockCode]);

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>{error}</div>;
    if (!candleData.length) return <div>데이터가 없습니다.</div>;

    // 데이터 정렬 (시간순)
    const sortedData = [...candleData].sort((a, b) => {
        const timeA = `${a.stckBsopDate}${a.stckCntgHour}`;
        const timeB = `${b.stckBsopDate}${b.stckCntgHour}`;
        return timeA.localeCompare(timeB);
    });

    // 차트 데이터 구성
    const chartData = {
        labels: sortedData.map(data => {
            const time = data.stckCntgHour;
            return `${time.slice(0, 2)}:${time.slice(2, 4)}`;
        }),
        datasets: [{
            label: '가격',
            data: sortedData.map(data => data.stckPrpr),
            backgroundColor: sortedData.map(data => 
                data.stckPrpr >= data.stckOprc ? 'rgba(255, 99, 132, 0.5)' : 'rgba(54, 162, 235, 0.5)'
            ),
            borderColor: sortedData.map(data => 
                data.stckPrpr >= data.stckOprc ? 'rgb(255, 99, 132)' : 'rgb(54, 162, 235)'
            ),
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.9,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: '1분봉 차트',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const index = context.dataIndex;
                        const data = sortedData[index];
                        return [
                            `시가: ${data.stckOprc.toLocaleString()}`,
                            `고가: ${data.stckHgpr.toLocaleString()}`,
                            `저가: ${data.stckLwpr.toLocaleString()}`,
                            `종가: ${data.stckPrpr.toLocaleString()}`
                        ];
                    }
                }
            }
        },
        scales: {
            y: {
                position: 'right',
                beginAtZero: false,
                ticks: {
                    callback: function(value) {
                        return value.toLocaleString();
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        }
    };

    return (
        <div style={{ width: '100%', height: '500px', padding: '20px' }}>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default TimeCandleChart; 
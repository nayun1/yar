import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';

const MonthCandleChart = ({ stockCode }) => {
    const [candleData, setCandleData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const today = new Date();
                const endDate = today.toISOString().slice(0, 10).replace(/-/g, '');
                const startDate = new Date(today.setFullYear(today.getFullYear() - 2)) // 최근 2년치 월봉
                    .toISOString()
                    .slice(0, 10)
                    .replace(/-/g, '');

                const response = await axios.get('/time/stocks/month', {
                    params: {
                        stockCode,
                        startDate,
                        endDate,
                    },
                });

                setCandleData(response.data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError('데이터를 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [stockCode]);

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>{error}</div>;
    if (!candleData.length) return <div>데이터가 없습니다.</div>;

    const sortedData = [...candleData].sort((a, b) => a.date.localeCompare(b.date));
    const series = [{
        data: sortedData.map(item => ({
            x: `${item.date.slice(0, 4)}-${item.date.slice(4, 6)}`,
            y: [
                parseFloat(item.open),
                parseFloat(item.high),
                parseFloat(item.low),
                parseFloat(item.close)
            ]
        }))
    }];

    const options = {
        chart: {
            type: 'candlestick',
            height: 500,
            toolbar: {
                show: false,
            }
        },
        title: {
            text: '월봉 차트',
            align: 'left'
        },
        xaxis: {
            type: 'category',
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            tooltip: {
                enabled: true
            },
            labels: {
                formatter: value => value.toLocaleString()
            }
        },
        plotOptions: {
            candlestick: {
                colors: {
                    upward: '#FF6384',
                    downward: '#36A2EB'
                }
            }
        },
        tooltip: {
            enabled: true
        }
    };

    return (
        <div style={{ width: '100%', height: '500px', padding: '20px' }}>
            <ReactApexChart
                options={options}
                series={series}
                type="candlestick"
                height={500}
            />
        </div>
    );
};

export default MonthCandleChart;

import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';

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

    // 15분 간격의 시간만 필터링
    const timeLabels = sortedData
        .filter(data => {
            const minutes = data.stckCntgHour.slice(2, 4);
            return minutes === '00' || minutes === '15' || minutes === '30' || minutes === '45';
        })
        .map(data => `${data.stckCntgHour.slice(0, 2)}:${data.stckCntgHour.slice(2, 4)}`);

    // 차트 데이터 구성
    const series = [{
        data: sortedData.map(data => ({
            x: `${data.stckCntgHour.slice(0, 2)}:${data.stckCntgHour.slice(2, 4)}`,
            y: [data.stckOprc, data.stckHgpr, data.stckLwpr, data.stckPrpr]
        }))
    }];

    const options = {
        chart: {
            type: 'candlestick',
            height: 500,
            animations: {
                enabled: true
            },
            toolbar: {
                show: false
            }
        },
        title: {
            text: '1분봉 차트',
            align: 'left'
        },
        xaxis: {
            type: 'category',
            labels: {
                rotate: -45,
                rotateAlways: true,
                style: {
                    fontSize: '12px'
                },
                formatter: function(value) {
                    if (!value) return '';
                    const minutes = value.split(':')[1];
                    return (minutes === '00' || minutes === '15' || minutes === '30' || minutes === '45') ? value : '';
                }
            },
            axisBorder: {
                show: true
            },
            axisTicks: {
                show: true
            }
        },
        yaxis: {
            position: 'right',
            labels: {
                formatter: function(value) {
                    return value.toLocaleString();
                }
            }
        },
        tooltip: {
            enabled: true,
            custom: function({ seriesIndex, dataPointIndex, w }) {
                const data = sortedData[dataPointIndex];
                const date = data.stckBsopDate;
                const time = data.stckCntgHour;
                const formattedDate = `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`;
                const formattedTime = `${time.slice(0,2)}:${time.slice(2,4)}`;
                return `
                    <div style="background: white; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                        <div style="font-weight: bold; margin-bottom: 5px; font-size:16px; color:#222;">
                            ${formattedDate} ${formattedTime}
                        </div>
                        <div style="color: #FF6384;">시가: ${data.stckOprc.toLocaleString()}</div>
                        <div style="color: #FF6384;">고가: ${data.stckHgpr.toLocaleString()}</div>
                        <div style="color: #36A2EB;">저가: ${data.stckLwpr.toLocaleString()}</div>
                        <div style="color: #36A2EB;">종가: ${data.stckPrpr.toLocaleString()}</div>
                    </div>
                `;
            },
            style: {
                fontSize: '12px',
                fontFamily: 'Arial'
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
        grid: {
            xaxis: {
                lines: {
                    show: false
                }
            },
            yaxis: {
                lines: {
                    show: true,
                    style: {
                        colors: ['#E0E0E0'],
                        opacity: 0.5
                    }
                }
            },
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            }
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

export default TimeCandleChart; 
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';

const TimeCandleChart = ({ stockCode }) => {
    const [candleData, setCandleData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 데이터 정렬 (useMemo로 최적화)
    const processedData = useMemo(() => {
        if (!candleData.length) return [];

        const sorted = [...candleData].sort((a, b) => {
            const timeA = `${a.stckBsopDate}${a.stckCntgHour}`;
            const timeB = `${b.stckBsopDate}${b.stckCntgHour}`;
            return timeA.localeCompare(timeB);
        });

        // 모든 데이터 사용 (제한 제거)
        return sorted;
    }, [candleData]);

    // 차트 데이터 구성 (useMemo로 최적화)
    const series = useMemo(() => [{
        name: 'Candlestick',
        data: processedData.map(data => ({
            x: `${data.stckCntgHour.slice(0, 2)}:${data.stckCntgHour.slice(2, 4)}`,
            y: [
                parseInt(data.stckOprc),
                parseInt(data.stckHgpr),
                parseInt(data.stckLwpr),
                parseInt(data.stckPrpr)
            ]
        }))
    }], [processedData]);

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

    const options = {
        chart: {
            type: 'candlestick',
            height: 500,
            animations: {
                enabled: false, // 애니메이션 비활성화로 성능 향상
                dynamicAnimation: {
                    enabled: false
                }
            },
            toolbar: {
                show: false
            },
            background: 'rgb(35, 35, 39)', // 차트 배경색 변경
            foreColor: '#ffffff', // 텍스트 색상을 흰색으로 변경
            redrawOnParentResize: false, // 부모 크기 변경 시 재그리기 비활성화
            redrawOnWindowResize: false // 윈도우 크기 변경 시 재그리기 비활성화
        },
        title: {
            text: '',
            align: 'left',
            style: {
                color: '#ffffff' // 타이틀 색상을 흰색으로 변경
            }
        },
        xaxis: {
            type: 'category',
            labels: {
                rotate: -45,
                rotateAlways: true,
                style: {
                    fontSize: '12px',
                    colors: '#ffffff' // x축 라벨 색상을 흰색으로 변경
                },
                formatter: function(value) {
                    if (!value) return '';
                    const minutes = value.split(':')[1];
                    return (minutes === '00' || minutes === '15' || minutes === '30' || minutes === '45') ? value : '';
                },
                maxHeight: 120
            },
            axisBorder: {
                show: true,
                color: '#3a3a3a' // x축 테두리 색상 변경
            },
            axisTicks: {
                show: true,
                color: '#3a3a3a' // x축 틱 색상 변경
            },
            tickAmount: undefined
        },
        yaxis: {
            position: 'right',
            labels: {
                formatter: function(value) {
                    return value.toLocaleString();
                },
                style: {
                    colors: '#ffffff'
                }
            }
        },
        tooltip: {
            enabled: true,
            enabledOnSeries: undefined,
            shared: false,
            followCursor: false,
            intersect: false,
            inverseOrder: false,
            custom: function({ seriesIndex, dataPointIndex, w }) {
                const data = processedData[dataPointIndex];
                const date = data.stckBsopDate;
                const time = data.stckCntgHour;
                const formattedDate = `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`;
                const formattedTime = `${time.slice(0,2)}:${time.slice(2,4)}`;
                return `
                    <div style="background: rgb(35, 35, 39); padding: 10px; border: 1px solid #3a3a3a; border-radius: 4px;">
                        <div style="font-weight: bold; margin-bottom: 5px; font-size:16px; color:#ffffff;">
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
            },
            fixed: {
                enabled: false,
                position: 'topRight'
            }
        },
        plotOptions: {
            candlestick: {
                colors: {
                    upward: '#FF6384',
                    downward: '#36A2EB'
                },
                wick: {
                    useFillColor: true
                }
            }
        },
        grid: {
            show: true,
            borderColor: '#2a2a2a', // 그리드 라인 색상
            strokeDashArray: 0,
            position: 'back',
            xaxis: {
                lines: {
                    show: false
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            },
            row: {
                colors: undefined,
                opacity: 0.3
            },
            column: {
                colors: undefined,
                opacity: 0.3
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

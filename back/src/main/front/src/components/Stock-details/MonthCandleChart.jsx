//MonthCandleChart.jsx
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
                const startDate = new Date(today.setFullYear(today.getFullYear() - 5)) // 최근 5년치 월봉
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
            animations: {
                enabled: false,
                dynamicAnimation: {
                    enabled: false
                }
            },
            toolbar: {
                show: false
            },
            background: 'rgb(29, 29, 34)',
            foreColor: '#ffffff',
            redrawOnParentResize: false,
            redrawOnWindowResize: false
        },
        title: {
            text: '',
            align: 'left',
            style: {
                color: '#ffffff'
            }
        },
        xaxis: {
            type: 'category',
            labels: {
                rotate: -45,
                rotateAlways: true,
                style: {
                    fontSize: '12px',
                    colors: '#ffffff'
                },
                maxHeight: 120
            },
            axisBorder: {
                show: true,
                color: '#3a3a3a'
            },
            axisTicks: {
                show: true,
                color: '#3a3a3a'
            }
        },
        yaxis: {
            position: 'right',
            tooltip: {
                enabled: true
            },
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
                const data = sortedData[dataPointIndex];
                const date = data.date;
                const formattedDate = `${date.slice(0,4)}-${date.slice(4,6)}`;
                return `
                    <div style="background: rgb(35, 35, 39); padding: 10px; border: 1px solid #3a3a3a; border-radius: 4px;">
                        <div style="font-weight: bold; margin-bottom: 5px; font-size:16px; color:#ffffff;">
                            ${formattedDate}
                        </div>
                        <div style="color: #FF6384;">시가: ${parseFloat(data.open).toLocaleString()}</div>
                        <div style="color: #FF6384;">고가: ${parseFloat(data.high).toLocaleString()}</div>
                        <div style="color: #36A2EB;">저가: ${parseFloat(data.low).toLocaleString()}</div>
                        <div style="color: #36A2EB;">종가: ${parseFloat(data.close).toLocaleString()}</div>
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
            borderColor: '#2a2a2a',
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

export default MonthCandleChart;

package com.yar.back.dto;

import com.yar.back.entity.Stock;

public class StockDTO {
    // 기본 주식 정보
    private String companyName;
    private String stockCode;
    private Long marketCap;
    private String marketType;
    private String marketIcon;

    // 실시간 데이터
    private String currentPrice;
    private String changeRate;
    private String changeAmount;
    private String volume;
    private String tradingValue;

    // 상태 정보
    private boolean isRealTimeAvailable;
    private String errorMessage;

    public StockDTO(Stock stock) {
        this.companyName = stock.getCompanyName();
        this.stockCode = stock.getStockCode();
        this.marketCap = stock.getMarketCap();
        this.marketType = stock.getMarketType();
        this.marketIcon = getMarketIcon(stock.getMarketType());
        this.isRealTimeAvailable = false;
    }

    private String getMarketIcon(String marketType) {
        if (marketType == null) return "❓";

        return switch (marketType.trim()) {
            case "유가증권", "유가증권시장" -> "🏛️";
            case "코스닥" -> "🟡";
            case "코넥스" -> "🟢";
            case "ETF" -> "📈";
            case "ETN" -> "📊";
            case "ELW" -> "💎";
            default -> "❓";
        };
    }

    // 실시간 데이터 설정
    public void setRealTimeData(String currentPrice, String changeRate,
                                String changeAmount, String volume, String tradingValue) {
        this.currentPrice = currentPrice;
        this.changeRate = changeRate;
        this.changeAmount = changeAmount;
        this.volume = volume;
        this.tradingValue = tradingValue;
        this.isRealTimeAvailable = true;
    }

    // 에러 상태 설정
    public void setError(String errorMessage) {
        this.errorMessage = errorMessage;
        this.isRealTimeAvailable = false;
    }

    // Getters
    public String getCompanyName() { return companyName; }
    public String getStockCode() { return stockCode; }
    public Long getMarketCap() { return marketCap; }
    public String getMarketType() { return marketType; }
    public String getMarketIcon() { return marketIcon; }
    public String getCurrentPrice() { return currentPrice; }
    public String getChangeRate() { return changeRate; }
    public String getChangeAmount() { return changeAmount; }
    public String getVolume() { return volume; }
    public String getTradingValue() { return tradingValue; }
    public boolean isRealTimeAvailable() { return isRealTimeAvailable; }
    public String getErrorMessage() { return errorMessage; }
}

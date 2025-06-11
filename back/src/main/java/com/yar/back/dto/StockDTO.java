package com.yar.back.dto;

import com.yar.back.entity.Stock;

public class StockDTO {
    // 기존 필드들 (DB에서)
    private String companyName;
    private String stockCode;
    private Long marketCap;
    private String marketType;
    private String marketIcon; // 아이콘 추가 필드

    // 실시간 데이터 필드들 (API에서)
    private String currentPrice;     // 현재가
    private String changeRate;       // 등락률
    private String changeAmount;     // 등락금액
    private String volume;           // 거래량
    private String tradingValue;     // 거래대금

    // 상태 정보
    private boolean isRealTimeAvailable; // 실시간 데이터 사용 가능 여부
    private String errorMessage;     // 에러 메시지

    // 기존 Constructor (DB 데이터만)
    public StockDTO(Stock stock) {
        this.companyName = stock.getCompanyName();
        this.stockCode = stock.getStockCode();
        this.marketCap = stock.getMarketCap();
        this.marketType = stock.getMarketType();
        this.marketIcon = getMarketIcon(stock.getMarketType());
        this.isRealTimeAvailable = false; // 초기값
    }

    // 새로운 정적 팩토리 메서드 (기존 생성자와 동일)
    public static StockDTO fromEntity(Stock stock) {
        return new StockDTO(stock);
    }

    // 모든 시장 타입에 대한 아이콘 매핑
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

    // 실시간 데이터 설정 메서드
    public void setRealTimeData(String currentPrice, String changeRate,
                                String changeAmount, String volume, String tradingValue) {
        this.currentPrice = currentPrice;
        this.changeRate = changeRate;
        this.changeAmount = changeAmount;
        this.volume = volume;
        this.tradingValue = tradingValue;
        this.isRealTimeAvailable = true;
    }

    // 에러 상태 설정 메서드
    public void setError(String errorMessage) {
        this.errorMessage = errorMessage;
        this.isRealTimeAvailable = false;
    }

    // 기존 Getter들
    public String getCompanyName() { return companyName; }
    public String getStockCode() { return stockCode; }
    public Long getMarketCap() { return marketCap; }
    public String getMarketType() { return marketType; }
    public String getMarketIcon() { return marketIcon; }

    // 새로운 Getter들 (실시간 데이터)
    public String getCurrentPrice() { return currentPrice; }
    public String getChangeRate() { return changeRate; }
    public String getChangeAmount() { return changeAmount; }
    public String getVolume() { return volume; }
    public String getTradingValue() { return tradingValue; }
    public boolean isRealTimeAvailable() { return isRealTimeAvailable; }
    public String getErrorMessage() { return errorMessage; }

    // toString 메서드 (디버깅용)
    @Override
    public String toString() {
        return "StockDTO{" +
                "companyName='" + companyName + '\'' +
                ", stockCode='" + stockCode + '\'' +
                ", marketCap=" + marketCap +
                ", marketType='" + marketType + '\'' +
                ", marketIcon='" + marketIcon + '\'' +
                ", currentPrice='" + currentPrice + '\'' +
                ", changeRate='" + changeRate + '\'' +
                ", isRealTimeAvailable=" + isRealTimeAvailable +
                '}';
    }
}

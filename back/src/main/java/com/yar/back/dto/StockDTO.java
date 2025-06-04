package com.yar.back.dto;

import com.yar.back.entity.Stock;

public class StockDTO {
    private String companyName;
    private String stockCode;
    private Long marketCap;
    private String marketType;
    private String marketIcon; // 아이콘 추가 필드

    // Constructor
    public StockDTO(Stock stock) {
        this.companyName = stock.getCompanyName();
        this.stockCode = stock.getStockCode();
        this.marketCap = stock.getMarketCap();
        this.marketType = stock.getMarketType();
        this.marketIcon = getMarketIcon(stock.getMarketType());
    }

    private String getMarketIcon(String marketType) {
        return switch (marketType) {
            case "유가증권" -> "🏛️";
            case "코스닥" -> "📈";
            default -> "❓";
        };
    }

    // Getter
    public String getCompanyName() { return companyName; }
    public String getStockCode() { return stockCode; }
    public Long getMarketCap() { return marketCap; }
    public String getMarketType() { return marketType; }
    public String getMarketIcon() { return marketIcon; }
}

package com.yar.back.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "company", indexes = {
        @Index(name = "idx_company_name", columnList = "companyName"),
        @Index(name = "idx_market_cap", columnList = "marketCap"),
        @Index(name = "idx_market_type", columnList = "marketType")
})
public class Stock {

    @Id
    @Column(name = "stock_code", length = 10)
    private String stockCode; // 종목코드 (CSV: 종목코드)

    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName; // 회사명 (CSV: 종목명)

    @Column(name = "market_cap")
    private Long marketCap; // 시가총액 (CSV: 시가총액_억원)

    @Column(name = "market_type", length = 20)
    private String marketType; // 시장구분 (CSV: 시장구분)

    // 기본 생성자
    public Stock() {}

    // 모든 필드를 받는 생성자
    public Stock(String stockCode, String companyName, Long marketCap, String marketType) {
        this.stockCode = stockCode;
        this.companyName = companyName;
        this.marketCap = marketCap;
        this.marketType = marketType;
    }

    // Getter/Setter
    public String getStockCode() {
        return stockCode;
    }

    public void setStockCode(String stockCode) {
        this.stockCode = stockCode;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public Long getMarketCap() {
        return marketCap;
    }

    public void setMarketCap(Long marketCap) {
        this.marketCap = marketCap;
    }

    public String getMarketType() {
        return marketType;
    }

    public void setMarketType(String marketType) {
        this.marketType = marketType;
    }

    // equals, hashCode (종목코드 기준)
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Stock stock = (Stock) o;
        return stockCode != null ? stockCode.equals(stock.stockCode) : stock.stockCode == null;
    }

    @Override
    public int hashCode() {
        return stockCode != null ? stockCode.hashCode() : 0;
    }

    // toString
    @Override
    public String toString() {
        return "Stock{" +
                "stockCode='" + stockCode + '\'' +
                ", companyName='" + companyName + '\'' +
                ", marketCap=" + marketCap +
                ", marketType='" + marketType + '\'' +
                '}';
    }
}

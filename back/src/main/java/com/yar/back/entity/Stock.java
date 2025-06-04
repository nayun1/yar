package com.yar.back.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "company")
public class Stock {


    @Id
    @Column(name = "stock_code")
    private String stockCode; // 종목코드는 고유하므로 ID로 지정

    @Column(name = "company_name")
    private String companyName;

    private Long marketCap;

    private String marketType;

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
}
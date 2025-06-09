package com.yar.back.dto;
import lombok.Data;

@Data
public class StockDetailDTO {
    private String date;         // 날짜 (stck_bsop_date)
    private String openPrice;    // 시가
    private String highPrice;    // 고가
    private String lowPrice;     // 저가
    private String closePrice;   // 종가
    private String volume;       // 거래량

    // getters/setters
}

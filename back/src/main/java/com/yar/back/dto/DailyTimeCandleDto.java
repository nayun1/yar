package com.yar.back.dto;

import lombok.Data;

@Data
public class DailyTimeCandleDto {
    private String stckBsopDate;
    private String stckCntgHour;
    private int stckPrpr;
    private int stckOprc;
    private int stckHgpr;
    private int stckLwpr;
    private long cntgVol;
    private long acmlTrPbmn;
}

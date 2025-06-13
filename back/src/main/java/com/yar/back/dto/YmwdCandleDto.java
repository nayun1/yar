package com.yar.back.dto;
import lombok.Builder;

import lombok.Data;

@Data
@Builder
public class YmwdCandleDto {
    private String date;     // 주식 영업 일자 (stck_bsop_date)
    private String open;     // 시가 (stck_oprc)
    private String close;    // 종가 (stck_clpr)
    private String high;     // 최고가 (stck_hgpr)
    private String low;
}
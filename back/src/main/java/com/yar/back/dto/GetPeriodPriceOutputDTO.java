package com.yar.back.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class GetPeriodPriceOutputDTO {
    // ===== output1 =====
    private String prdyVrss;              // 전일 대비
    private String prdyVrssSign;          // 전일 대비 부호
    private String prdyCtrt;              // 전일 대비율
    private String stckPrdyClpr;          // 주식 전일 종가
    private String acmlVol;               // 누적 거래량
    private String acmlTrPbmn;            // 누적 거래 대금
    private String htsKorIsnm;            // HTS 한글 종목명
    private String stckPrpr;              // 주식 현재가
    private String stckShrnIscd;          // 주식 단축 종목코드
    private String prdyVol;               // 전일 거래량
    private String stckMxpr;              // 주식 상한가
    private String stckLlam;              // 주식 하한가
    private String stckOprc;              // 주식 시가2
    private String stckHgpr;              // 주식 최고가
    private String stckLwpr;              // 주식 최저가
    private String stckPrdyOprc;          // 주식 전일 시가
    private String stckPrdyHgpr;          // 주식 전일 최고가
    private String stckPrdyLwpr;          // 주식 전일 최저가
    private String askp;                  // 매도호가
    private String bidp;                  // 매수호가
    private String prdyVrssVol;           // 전일 대비 거래량
    private String volTnrt;               // 거래량 회전율
    private String stckFcam;              // 주식 액면가
    private String lstnStcn;              // 상장 주수
    private String cpfn;                  // 자본금
    private String htsAvls;               // HTS 시가총액
    private String per;                   // PER
    private String eps;                   // EPS
    private String pbr;                   // PBR
    private String itewholLoanRmndRatem;  // 전체 융자 잔고 비율

    // ===== output2 =====
    private List<PeriodPriceCandle> output2;

    @Getter
    @Setter
    @NoArgsConstructor
    @ToString
    public static class PeriodPriceCandle {
        private String stckBsopDate;       // 주식 영업 일자
        private String stckClpr;           // 주식 종가
        private String stckOprc;           // 주식 시가2
        private String stckHgpr;           // 주식 최고가
        private String stckLwpr;           // 주식 최저가
        private String acmlVol;            // 누적 거래량
        private String acmlTrPbmn;         // 누적 거래 대금
        private String flngClsCode;        // 락 구분 코드
        private String prttRate;           // 분할 비율
        private String modYn;              // 변경 여부
        private String prdyVrssSign;       // 전일 대비 부호
        private String prdyVrss;           // 전일 대비
        private String revlIssuReas;       // 재평가사유코드
    }
}

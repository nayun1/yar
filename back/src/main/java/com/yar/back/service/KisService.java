package com.yar.back.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yar.back.dto.VolumeRankOutputDTO;
import com.yar.back.dto.StockDetailDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

@Service
public class KisService {
    @Value("${appkey}")
    private String appkey;

    @Value("${appsecret}")
    private String appSecret;

    @Value("${access_token}")
    private String accessToken;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public KisService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.baseUrl("https://openapi.koreainvestment.com:9443").build();
        this.objectMapper = objectMapper;
    }

    // 거래량/거래대금 랭킹용 헤더 생성
    private HttpHeaders createVolumeRankHttpHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);
        headers.set("appkey", appkey);
        headers.set("appSecret", appSecret);
        headers.set("tr_id", "FHPST01710000");
        headers.set("custtype", "P");
        return headers;
    }

    // 급등락 랭킹용 헤더 생성
    private HttpHeaders createFluctuationRankHttpHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);
        headers.set("appkey", appkey);
        headers.set("appSecret", appSecret);
        headers.set("tr_id", "FHPST01700000");
        headers.set("custtype", "P");
        return headers;
    }

    // 주식 일봉 차트 조회용 헤더 생성
    private HttpHeaders createStockDetailHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);
        headers.set("appkey", appkey);
        headers.set("appSecret", appSecret);
        headers.set("tr_id", "FHKST03010100");
        headers.set("custtype", "P");
        return headers;
    }

    // 실시간 현재가 조회용 헤더 생성
    private HttpHeaders createCurrentPriceHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);
        headers.set("appkey", appkey);
        headers.set("appSecret", appSecret);
        headers.set("tr_id", "FHKST01010100");
        headers.set("custtype", "P");
        return headers;
    }

    // 실시간 주식 데이터 DTO
    public static class RealTimeStockData {
        private final String currentPrice;
        private final String changeRate;
        private final String changeAmount;
        private final String volume;
        private final String tradingValue;

        public RealTimeStockData(String currentPrice, String changeRate, String changeAmount,
                                 String volume, String tradingValue) {
            this.currentPrice = currentPrice;
            this.changeRate = changeRate;
            this.changeAmount = changeAmount;
            this.volume = volume;
            this.tradingValue = tradingValue;
        }

        public String getCurrentPrice() { return currentPrice; }
        public String getChangeRate() { return changeRate; }
        public String getChangeAmount() { return changeAmount; }
        public String getVolume() { return volume; }
        public String getTradingValue() { return tradingValue; }
    }

    // 거래량/거래대금 랭킹 응답 파싱
    private Mono<List<VolumeRankOutputDTO>> parseVolumeRank(String response) {
        try {
            List<VolumeRankOutputDTO> responseDataList = new ArrayList<>();
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode outputNode = rootNode.get("output");

            if (outputNode != null) {
                for (JsonNode node : outputNode) {
                    VolumeRankOutputDTO responseData = new VolumeRankOutputDTO();
                    responseData.setHtsKorIsnm(node.get("hts_kor_isnm").asText());
                    responseData.setMkscShrnIscd(node.get("mksc_shrn_iscd").asText());
                    responseData.setDataRank(node.get("data_rank").asText());
                    responseData.setStckPrpr(node.get("stck_prpr").asText());
                    responseData.setPrdyVrssSign(node.get("prdy_vrss_sign").asText());
                    responseData.setPrdyVrss(node.get("prdy_vrss").asText());
                    responseData.setPrdyCtrt(node.get("prdy_ctrt").asText());
                    responseData.setAcmlVol(node.get("acml_vol").asText());
                    responseData.setPrdyVol(node.get("prdy_vol").asText());
                    responseData.setLstnStcn(node.get("lstn_stcn").asText());
                    responseData.setAvrgVol(node.get("avrg_vol").asText());
                    responseData.setNBefrClprVrssPrprRate(node.get("n_befr_clpr_vrss_prpr_rate").asText());
                    responseData.setVolInrt(node.get("vol_inrt").asText());
                    responseData.setVolTnrt(node.get("vol_tnrt").asText());
                    responseData.setNdayVolTnrt(node.get("nday_vol_tnrt").asText());
                    responseData.setAvrgTrPbmn(node.get("avrg_tr_pbmn").asText());
                    responseData.setTrPbmnTnrt(node.get("tr_pbmn_tnrt").asText());
                    responseData.setNdayTrPbmnTnrt(node.get("nday_tr_pbmn_tnrt").asText());
                    responseData.setAcmlTrPbmn(node.get("acml_tr_pbmn").asText());
                    responseDataList.add(responseData);
                }
            }
            return Mono.just(responseDataList);
        } catch (Exception e) {
            return Mono.error(e);
        }
    }

    // 급등락 랭킹 응답 파싱
    private Mono<List<VolumeRankOutputDTO>> parseFluctuationRank(String response) {
        try {
            List<VolumeRankOutputDTO> responseDataList = new ArrayList<>();
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode outputNode = rootNode.get("output");

            if (outputNode != null) {
                for (JsonNode node : outputNode) {
                    VolumeRankOutputDTO responseData = new VolumeRankOutputDTO();
                    responseData.setHtsKorIsnm(node.get("hts_kor_isnm").asText());
                    responseData.setMkscShrnIscd(node.get("stck_shrn_iscd").asText());
                    responseData.setDataRank(node.get("data_rank").asText());
                    responseData.setStckPrpr(node.get("stck_prpr").asText());
                    responseData.setPrdyVrssSign(node.get("prdy_vrss_sign").asText());
                    responseData.setPrdyVrss(node.get("prdy_vrss").asText());
                    responseData.setPrdyCtrt(node.get("prdy_ctrt").asText());
                    responseData.setAcmlVol(node.get("acml_vol").asText());
                    // 나머지 필드들은 빈 값으로 설정
                    responseData.setPrdyVol("");
                    responseData.setLstnStcn("");
                    responseData.setAvrgVol("");
                    responseData.setNBefrClprVrssPrprRate("");
                    responseData.setVolInrt("");
                    responseData.setVolTnrt("");
                    responseData.setNdayVolTnrt("");
                    responseData.setAvrgTrPbmn("");
                    responseData.setTrPbmnTnrt("");
                    responseData.setNdayTrPbmnTnrt("");
                    responseData.setAcmlTrPbmn("");
                    responseDataList.add(responseData);
                }
            }
            return Mono.just(responseDataList);
        } catch (Exception e) {
            return Mono.error(e);
        }
    }

    // 주식 상세 정보(일봉) 응답 파싱
    private Mono<StockDetailDTO> parseStockPriceInfo(String response) {
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode output2Node = rootNode.get("output2");

            if (output2Node != null && output2Node.isArray() && output2Node.size() > 0) {
                JsonNode latestData = output2Node.get(0); // 가장 최근 데이터

                StockDetailDTO dto = new StockDetailDTO();
                dto.setDate(latestData.get("stck_bsop_date").asText());
                dto.setOpenPrice(latestData.get("stck_oprc").asText());
                dto.setHighPrice(latestData.get("stck_hgpr").asText());
                dto.setLowPrice(latestData.get("stck_lwpr").asText());
                dto.setClosePrice(latestData.get("stck_clpr").asText());
                dto.setVolume(latestData.get("acml_vol").asText());

                return Mono.just(dto);
            } else {
                return Mono.error(new RuntimeException("No stock price data found"));
            }
        } catch (Exception e) {
            return Mono.error(e);
        }
    }

    // 현재가 응답 파싱
    private Mono<RealTimeStockData> parseCurrentPrice(String response) {
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode outputNode = rootNode.get("output");

            if (outputNode != null) {
                String currentPrice = outputNode.get("stck_prpr").asText();
                String changeRate = outputNode.get("prdy_ctrt").asText();
                String changeAmount = outputNode.get("prdy_vrss").asText();
                String volume = outputNode.get("acml_vol").asText();
                String tradingValue = outputNode.get("acml_tr_pbmn").asText();

                RealTimeStockData data = new RealTimeStockData(
                        currentPrice, changeRate, changeAmount, volume, tradingValue
                );

                return Mono.just(data);
            } else {
                return Mono.error(new RuntimeException("No current price data found"));
            }
        } catch (Exception e) {
            return Mono.error(e);
        }
    }

    // 개별 종목 실시간 현재가 조회
    public Mono<RealTimeStockData> getRealTimeStockData(String stockCode) {
        HttpHeaders headers = createCurrentPriceHeaders();

        return webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/uapi/domestic-stock/v1/quotations/inquire-price")
                        .queryParam("FID_COND_MRKT_DIV_CODE", "J")
                        .queryParam("FID_INPUT_ISCD", stockCode)
                        .build())
                .headers(httpHeaders -> httpHeaders.addAll(headers))
                .retrieve()
                .bodyToMono(String.class)
                .flatMap(this::parseCurrentPrice)
                .onErrorResume(error -> {
                    System.err.println("❌ 실시간 데이터 조회 실패 - 종목코드: " + stockCode + ", 오류: " + error.getMessage());
                    return Mono.empty();
                });
    }

    // 거래량/거래대금 랭킹 범용 메서드
    public Mono<List<VolumeRankOutputDTO>> getRankData(String blngClsCode) {
        HttpHeaders headers = createVolumeRankHttpHeaders();

        return webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/uapi/domestic-stock/v1/quotations/volume-rank")
                        .queryParam("FID_COND_MRKT_DIV_CODE", "J")
                        .queryParam("FID_COND_SCR_DIV_CODE", "20171")
                        .queryParam("FID_INPUT_ISCD", "0000")
                        .queryParam("FID_DIV_CLS_CODE", "0")
                        .queryParam("FID_BLNG_CLS_CODE", blngClsCode)
                        .queryParam("FID_TRGT_CLS_CODE", "111111111")
                        .queryParam("FID_TRGT_EXLS_CLS_CODE", "000000")
                        .queryParam("FID_INPUT_PRICE_1", "0")
                        .queryParam("FID_INPUT_PRICE_2", "0")
                        .queryParam("FID_VOL_CNT", "0")
                        .queryParam("FID_INPUT_DATE_1", "0")
                        .build())
                .headers(httpHeaders -> httpHeaders.addAll(headers))
                .retrieve()
                .bodyToMono(String.class)
                .flatMap(this::parseVolumeRank);
    }

    // 급등락 랭킹 범용 메서드
    public Mono<List<VolumeRankOutputDTO>> getFluctuationRankData(String rankSortCode) {
        HttpHeaders headers = createFluctuationRankHttpHeaders();

        return webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/uapi/domestic-stock/v1/ranking/fluctuation")
                        .queryParam("fid_rsfl_rate2", "")
                        .queryParam("fid_cond_mrkt_div_code", "J")
                        .queryParam("fid_cond_scr_div_code", "20170")
                        .queryParam("fid_input_iscd", "0000")
                        .queryParam("fid_rank_sort_cls_code", rankSortCode)
                        .queryParam("fid_input_cnt_1", "0")
                        .queryParam("fid_prc_cls_code", "1")
                        .queryParam("fid_input_price_1", "")
                        .queryParam("fid_input_price_2", "")
                        .queryParam("fid_vol_cnt", "")
                        .queryParam("fid_trgt_cls_code", "0")
                        .queryParam("fid_trgt_exls_cls_code", "0")
                        .queryParam("fid_div_cls_code", "0")
                        .queryParam("fid_rsfl_rate1", "")
                        .build())
                .headers(httpHeaders -> httpHeaders.addAll(headers))
                .retrieve()
                .bodyToMono(String.class)
                .flatMap(this::parseFluctuationRank);
    }

    // 편의 메서드들
    public Mono<List<VolumeRankOutputDTO>> getVolumeRank() {
        return getRankData("0"); // 거래량
    }

    public Mono<List<VolumeRankOutputDTO>> getTradingValueRank() {
        return getRankData("3"); // 거래대금
    }

    public Mono<List<VolumeRankOutputDTO>> getRiseRank() {
        return getFluctuationRankData("0"); // 급상승
    }

    public Mono<List<VolumeRankOutputDTO>> getFallRank() {
        return getFluctuationRankData("1"); // 급하락
    }

    // 주식 상세 정보 조회 (일봉 차트)
    public Mono<StockDetailDTO> getStockDetailByCode(String code) {
        HttpHeaders headers = createStockDetailHeaders();

        return webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice")
                        .queryParam("FID_COND_MRKT_DIV_CODE", "J")
                        .queryParam("FID_INPUT_ISCD", code)
                        .queryParam("FID_INPUT_DATE_1", "20250101")
                        .queryParam("FID_INPUT_DATE_2", "20250609")
                        .queryParam("FID_PERIOD_DIV_CODE", "D")
                        .queryParam("FID_ORG_ADJ_PRC", "0")
                        .build())
                .headers(httpHeaders -> httpHeaders.addAll(headers))
                .retrieve()
                .bodyToMono(String.class)
                .flatMap(this::parseStockPriceInfo);
    }
}

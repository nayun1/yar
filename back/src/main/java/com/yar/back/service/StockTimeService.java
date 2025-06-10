package com.yar.back.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yar.back.dto.DailyTimeCandleDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class StockTimeService {

    private final RestTemplate restTemplate;
    private final String baseUrl = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-time-dailychartprice";

    @Value("${appkey}")
    private String appkey;

    @Value("${appsecret}")
    private String appSecret;

    @Value("${access_token}")
    private String accessToken;

    public StockTimeService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.build();
    }

    public List<DailyTimeCandleDto> getDailyTimeCandles(String stockCode) {
        List<DailyTimeCandleDto> result = new ArrayList<>();

        // 현재 시각
        LocalDateTime now = LocalDateTime.now();

        // 120분 전
        LocalDateTime past = now.minusMinutes(120);

        // 두 번 요청해서 데이터 수집
        result.addAll(fetch120Candles(stockCode, now));
        result.addAll(fetch120Candles(stockCode, past));

        return result;
    }

    private List<DailyTimeCandleDto> fetch120Candles(String stockCode, LocalDateTime time) {
        String dateStr = time.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String hourStr = time.format(DateTimeFormatter.ofPattern("HHmmss"));

        HttpHeaders headers = new HttpHeaders();
        headers.set("content-type", "application/json; charset=utf-8");
        headers.set("authorization", "Bearer " + accessToken);
        headers.set("appkey", appkey);
        headers.set("appsecret", appSecret);
        headers.set("tr_id", "FHKST03010230");
        headers.set("custtype", "P");

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("FID_COND_MRKT_DIV_CODE", "J")
                .queryParam("FID_INPUT_ISCD", stockCode)
                .queryParam("FID_INPUT_HOUR_1", hourStr)
                .queryParam("FID_INPUT_DATE_1", dateStr)
                .queryParam("FID_PW_DATA_INCU_YN", "Y")
                .queryParam("FID_FAKE_TICK_INCU_YN", " ");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                builder.toUriString(),
                HttpMethod.GET,
                entity,
                String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("API 호출 실패: " + response.getStatusCode());
        }

        String body = response.getBody();
        ObjectMapper mapper = new ObjectMapper();
        List<DailyTimeCandleDto> list = new ArrayList<>();
        try {
            JsonNode root = mapper.readTree(body);
            JsonNode output2 = root.path("output2");
            for (JsonNode node : output2) {
                DailyTimeCandleDto dto = new DailyTimeCandleDto();
                dto.setStckBsopDate(node.path("stck_bsop_date").asText());
                dto.setStckCntgHour(node.path("stck_cntg_hour").asText());
                dto.setStckPrpr(node.path("stck_prpr").asInt());
                dto.setStckOprc(node.path("stck_oprc").asInt());
                dto.setStckHgpr(node.path("stck_hgpr").asInt());
                dto.setStckLwpr(node.path("stck_lwpr").asInt());
                dto.setCntgVol(node.path("cntg_vol").asLong());
                dto.setAcmlTrPbmn(node.path("acml_tr_pbmn").asLong());
                list.add(dto);
            }
        } catch (Exception e) {
            throw new RuntimeException("JSON 파싱 실패", e);
        }

        return list;
    }
}
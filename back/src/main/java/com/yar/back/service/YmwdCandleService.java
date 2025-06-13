package com.yar.back.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yar.back.dto.YmwdCandleDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
@Service
public class YmwdCandleService {

    private final RestTemplate restTemplate;
    private final String baseUrl = "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice";

    @Value("${appkey}")
    private String appkey;

    @Value("${appsecret}")
    private String appSecret;

    @Value("${access_token}")
    private String accessToken;

    public YmwdCandleService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.build();
    }

    public List<YmwdCandleDto> getPricesByPeriod(String stockCode, String startDate, String endDate, String periodCode) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("FID_COND_MRKT_DIV_CODE", "J")
                .queryParam("FID_INPUT_ISCD", stockCode)
                .queryParam("FID_INPUT_DATE_1", startDate)
                .queryParam("FID_INPUT_DATE_2", endDate)
                .queryParam("FID_PERIOD_DIV_CODE", periodCode)
                .queryParam("FID_ORG_ADJ_PRC", "0");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("authorization", "Bearer " + accessToken);
        headers.set("appkey", appkey);
        headers.set("appsecret", appSecret);
        headers.set("tr_id", "FHKST03010100");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                builder.toUriString(),
                HttpMethod.GET,
                entity,
                String.class
        );

        List<YmwdCandleDto> result = new ArrayList<>();
        if (response.getStatusCode().is2xxSuccessful()) {
            String body = response.getBody();
            ObjectMapper mapper = new ObjectMapper();
            try {
                JsonNode root = mapper.readTree(body);
                JsonNode output2 = root.path("output2");
                for (JsonNode node : output2) {
                    YmwdCandleDto dto = YmwdCandleDto.builder()
                            .date(node.path("stck_bsop_date").asText())
                            .open(node.path("stck_oprc").asText())
                            .close(node.path("stck_clpr").asText())
                            .high(node.path("stck_hgpr").asText())
                            .low(node.path("stck_lwpr").asText())
                            .build();
                    result.add(dto);
                }
            } catch (Exception e) {
                throw new RuntimeException("JSON 파싱 실패", e);
            }
        } else {
            throw new RuntimeException("API 호출 실패: " + response.getStatusCode());
        }

        return result;
    }

}

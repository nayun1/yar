package com.yar.back.service;

import com.yar.back.entity.Stock;
import com.yar.back.repository.StockRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@Service
public class StockService {

    @Autowired
    private StockRepository stockRepository;
    @PostConstruct
    public void importStockCsv() {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new ClassPathResource("init/stock.csv").getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                }

                // 👇 디버깅: 한 줄 전체 출력
                System.out.println(">> 라인 내용: " + line);

                String[] tokens = line.split(",");
                // 👇 디버깅: 분리된 토큰 출력
                System.out.println(">> 파싱된 토큰: " + Arrays.toString(tokens));

                if (tokens.length >= 4) {
                    String companyName = tokens[0].trim();
                    String stockCode = tokens[1].trim();
                    String marketCapStr = tokens[2].trim();
                    String marketType = tokens[3].trim();

                    Long marketCap;
                    try {
                        marketCap = Long.parseLong(marketCapStr);
                    } catch (NumberFormatException e) {
                        System.err.println("⚠️ 잘못된 시가총액 데이터: " + marketCapStr);
                        continue;
                    }

                    // 👇 디버깅: 저장 전 객체 내용 확인
                    System.out.println(">> 저장할 Stock: " + companyName + ", " + stockCode + ", " + marketCap + ", " + marketType);

                    Stock stock = new Stock();
                    stock.setCompanyName(companyName);
                    stock.setStockCode(stockCode);
                    stock.setMarketCap(marketCap);
                    stock.setMarketType(marketType);

                    stockRepository.save(stock);
                } else {
                    System.err.println("⚠️ 필드 수 부족: " + line);
                }
            }

            System.out.println("✅ stock.csv import complete.");

        } catch (Exception e) {
            System.err.println("❌ Failed to import stock.csv:");
            e.printStackTrace();
        }
    }

}

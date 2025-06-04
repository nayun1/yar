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
import java.util.List;

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
                if (firstLine) { // skip header
                    firstLine = false;
                    continue;
                }

                String[] tokens = line.split(",");
                if (tokens.length >= 4) {
                    String stockName = tokens[0].trim();
                    String stockCode = tokens[1].trim();
                    String marketCapStr = tokens[2].trim().replaceAll("[^\\d]", "");
                    String marketType = tokens[3].trim();

                    Long marketCap = null;
                    try {
                        marketCap = Long.parseLong(marketCapStr);
                    } catch (NumberFormatException e) {
                        System.err.println("⚠️ 시가총액 파싱 실패: " + marketCapStr);
                    }

                    Stock stock = new Stock();
                    stock.setCompanyName(stockName);
                    stock.setStockCode(stockCode);
                    stock.setMarketCap(marketCap);
                    stock.setMarketType(marketType);

                    stockRepository.save(stock);
                } else {
                    System.out.println("⚠️ 필드 수 부족: " + line);
                }
            }

            System.out.println("✅ stock.csv import complete.");

        } catch (Exception e) {
            System.err.println("❌ Failed to import stock.csv:");
            e.printStackTrace();
        }
    }
    public StockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    public List<Stock> searchStockByName(String name) {
        return stockRepository.findByCompanyName(name);
    }

}

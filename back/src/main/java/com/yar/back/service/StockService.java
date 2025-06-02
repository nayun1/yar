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
                if (tokens.length >= 2) {
                    String stockName = tokens[0].trim();
                    String stockCode = tokens[1].trim();

                    Stock stock = new Stock();
                    stock.setCompanyName(stockName);
                    stock.setStockCode(stockCode);

                    stockRepository.save(stock);
                }
            }

            System.out.println("✅ stock.csv import complete.");

        } catch (Exception e) {
            System.err.println("❌ Failed to import stock.csv:");
            e.printStackTrace();
        }
    }
}

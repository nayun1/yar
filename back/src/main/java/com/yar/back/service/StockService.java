package com.yar.back.service;

import com.yar.back.dto.StockDTO;
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
import java.util.Optional;

@Service
public class StockService {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private KisService kisService;

    public StockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    @PostConstruct
    public void importStockCsv() {
        if (stockRepository.count() > 0) {
            System.out.println("✅ 주식 데이터가 이미 존재합니다. CSV 로딩을 건너뜁니다.");
            return;
        }

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new ClassPathResource("init/stock.csv").getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            boolean firstLine = true;
            int successCount = 0;
            int errorCount = 0;

            while ((line = reader.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                }

                String[] tokens = line.split(",");
                if (tokens.length >= 4) {
                    try {
                        String stockName = tokens[0].trim();
                        String stockCode = tokens[1].trim();
                        String marketCapStr = tokens[2].trim().replaceAll("[^\\d]", "");
                        String marketType = tokens[3].trim();

                        Long marketCap = 0L;
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
                        successCount++;
                    } catch (Exception e) {
                        System.err.println("⚠️ 라인 처리 실패: " + line);
                        errorCount++;
                    }
                } else {
                    System.out.println("⚠️ 필드 수 부족: " + line);
                    errorCount++;
                }
            }

            System.out.println("✅ stock.csv import complete. 성공: " + successCount + "개, 실패: " + errorCount + "개");

        } catch (Exception e) {
            System.err.println("❌ Failed to import stock.csv:");
            e.printStackTrace();
        }
    }

    // 검색 기능 - 기본 Stock 엔티티 반환
    public List<Stock> searchStockByName(String name) {
        return stockRepository.findByCompanyName(name);
    }

    // 종목 상세 정보 조회 - 실시간 데이터 포함 StockDTO 반환
    public Optional<StockDTO> getStockDetail(String stockCode) {
        try {
            Optional<Stock> stockOpt = stockRepository.findByStockCode(stockCode);
            if (stockOpt.isEmpty()) {
                return Optional.empty();
            }

            Stock stock = stockOpt.get();
            StockDTO stockDTO = convertToStockDTO(stock);

            return Optional.of(stockDTO);

        } catch (Exception e) {
            System.err.println("❌ 종목 상세 조회 중 오류 발생: " + e.getMessage());
            return Optional.empty();
        }
    }

    // Stock 엔티티를 StockDTO로 변환 (실시간 데이터 포함)
    private StockDTO convertToStockDTO(Stock stock) {
        try {
            StockDTO stockDTO = new StockDTO(stock);

            // 실시간 데이터 조회 시도
            if (kisService != null) {
                try {
                    KisService.RealTimeStockData realTimeData = kisService.getRealTimeStockData(stock.getStockCode())
                            .block();

                    if (realTimeData != null) {
                        stockDTO.setRealTimeData(
                                realTimeData.getCurrentPrice(),
                                realTimeData.getChangeRate(),
                                realTimeData.getChangeAmount(),
                                realTimeData.getVolume(),
                                realTimeData.getTradingValue()
                        );
                    }
                } catch (Exception e) {
                    System.err.println("⚠️ 실시간 데이터 조회 실패 - " + stock.getStockCode() + ": " + e.getMessage());
                    stockDTO.setError("실시간 데이터 조회 실패");
                }
            }

            return stockDTO;

        } catch (Exception e) {
            System.err.println("❌ StockDTO 변환 실패 - 종목코드: " + stock.getStockCode());
            StockDTO errorDTO = new StockDTO(stock);
            errorDTO.setError("데이터 변환 실패");
            return errorDTO;
        }
    }
}

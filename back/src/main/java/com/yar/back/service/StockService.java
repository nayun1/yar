//StockService.java
package com.yar.back.service;

import com.yar.back.dto.StockDTO;
import com.yar.back.entity.Stock;
import com.yar.back.repository.StockRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StockService {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private KisService kisService; // 한국투자증권 API 서비스

    private static final int SEARCH_LIMIT = 50; // 검색 결과 제한
    private static final int MAIN_PAGE_LIMIT = 30; // 메인 페이지 표시 제한

    public StockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    @PostConstruct
    public void importStockCsv() {
        // 데이터가 이미 있으면 스킵
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
                if (firstLine) { // skip header
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

                        Long marketCap = null;
                        try {
                            marketCap = Long.parseLong(marketCapStr);
                        } catch (NumberFormatException e) {
                            System.err.println("⚠️ 시가총액 파싱 실패: " + marketCapStr);
                            marketCap = 0L; // 기본값 설정
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

    // 기존 메서드 유지 (메인 검색에서 사용)
    public List<Stock> searchStockByName(String name) {
        return stockRepository.findByCompanyName(name);
    }

    // 메인 페이지용 - 시가총액 상위 종목들
    public List<StockDTO> getTopStocks() {
        try {
            Pageable pageable = PageRequest.of(0, MAIN_PAGE_LIMIT);
            List<Stock> stocks = stockRepository.findTopStocksByMarketCap(pageable);

            return stocks.stream()
                    .map(this::convertToStockDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            System.err.println("❌ 상위 종목 조회 중 오류 발생: " + e.getMessage());
            return List.of();
        }
    }

    // 종목 상세 정보 조회
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

    // 시장구분별 종목 조회
    public List<StockDTO> getStocksByMarketType(String marketType) {
        try {
            Pageable pageable = PageRequest.of(0, SEARCH_LIMIT);
            List<Stock> stocks = stockRepository.findByMarketType(marketType, pageable);

            return stocks.stream()
                    .map(this::convertToStockDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            System.err.println("❌ 시장구분별 종목 조회 중 오류 발생: " + e.getMessage());
            return List.of();
        }
    }

    // Stock 엔티티를 StockDTO로 변환 (실시간 데이터 포함)
    private StockDTO convertToStockDTO(Stock stock) {
        try {
            StockDTO stockDTO = new StockDTO(stock);

            // KisService로 실시간 데이터 조회
            if (kisService != null) {
                try {
                    // 한국투자증권 API로 실시간 데이터 조회 (동기 처리)
                    KisService.RealTimeStockData realTimeData = kisService.getRealTimeStockData(stock.getStockCode())
                            .block(); // Mono를 동기적으로 처리

                    if (realTimeData != null) {
                        stockDTO.setRealTimeData(
                                realTimeData.getCurrentPrice(),
                                realTimeData.getChangeRate(),
                                realTimeData.getChangeAmount(),
                                realTimeData.getVolume(),
                                realTimeData.getTradingValue()
                        );
                    } else {
                        stockDTO.setError("실시간 데이터 조회 실패");
                    }
                } catch (Exception e) {
                    stockDTO.setError("실시간 데이터 조회 실패: " + e.getMessage());
                }
            } else {
                stockDTO.setError("KisService 사용 불가");
            }

            return stockDTO;

        } catch (Exception e) {
            System.err.println("❌ StockDTO 변환 실패 - 종목코드: " + stock.getStockCode() + ", 오류: " + e.getMessage());
            StockDTO errorDTO = new StockDTO(stock);
            errorDTO.setError("데이터 변환 실패");
            return errorDTO;
        }
    }
}

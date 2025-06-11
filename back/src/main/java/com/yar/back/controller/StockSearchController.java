//StockSearchController.java
package com.yar.back.controller;

import com.yar.back.dto.StockDTO;
import com.yar.back.entity.Stock;
import com.yar.back.service.StockService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = "http://localhost:3000")
public class StockSearchController {

    private final StockService stockService;

    public StockSearchController(StockService stockService) {
        this.stockService = stockService;
    }

    // 기존 메서드 유지 (하위 호환성) - 메인 검색에서 사용
    @GetMapping("/search")
    public List<Stock> searchStocks(@RequestParam("name") String name) {
        return stockService.searchStockByName(name);
    }

    // 메인 페이지용 - 시가총액 상위 종목들
    @GetMapping("/top")
    public ResponseEntity<List<StockDTO>> getTopStocks() {
        try {
            List<StockDTO> stocks = stockService.getTopStocks();
            return ResponseEntity.ok(stocks);
        } catch (Exception e) {
            System.err.println("❌ 상위 종목 조회 실패: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // 종목 상세 정보 조회
    @GetMapping("/detail/{stockCode}")
    public ResponseEntity<StockDTO> getStockDetail(@PathVariable("stockCode") String stockCode) {
        try {
            Optional<StockDTO> stock = stockService.getStockDetail(stockCode);

            if (stock.isPresent()) {
                return ResponseEntity.ok(stock.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("❌ 종목 상세 조회 실패: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // 시장구분별 종목 조회
    @GetMapping("/market/{marketType}")
    public ResponseEntity<List<StockDTO>> getStocksByMarketType(@PathVariable("marketType") String marketType) {
        try {
            List<StockDTO> stocks = stockService.getStocksByMarketType(marketType);
            return ResponseEntity.ok(stocks);
        } catch (Exception e) {
            System.err.println("❌ 시장구분별 종목 조회 실패: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // 헬스체크
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Stock Search API is running");
    }
}

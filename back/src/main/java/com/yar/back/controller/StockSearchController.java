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
public class StockSearchController {

    private final StockService stockService;

    public StockSearchController(StockService stockService) {
        this.stockService = stockService;
    }

    // 검색 기능 - 기본 Stock 엔티티 반환
    @GetMapping("/search")
    public ResponseEntity<List<Stock>> searchStocks(@RequestParam("name") String name) {
        try {
            List<Stock> stocks = stockService.searchStockByName(name);
            return ResponseEntity.ok(stocks);
        } catch (Exception e) {
            System.err.println("❌ 주식 검색 실패: " + e.getMessage());
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
}

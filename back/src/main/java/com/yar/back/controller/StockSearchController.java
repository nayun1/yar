package com.yar.back.controller;

import com.yar.back.entity.Stock;
import com.yar.back.service.StockService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
public class StockSearchController {

    private final StockService stockService;

    public StockSearchController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping("/search")
    public List<Stock> searchStocks(@RequestParam("name") String name) {
        return stockService.searchStockByName(name);
    }
}

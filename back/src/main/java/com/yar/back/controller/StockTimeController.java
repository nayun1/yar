package com.yar.back.controller;

import com.yar.back.dto.DailyTimeCandleDto;
import com.yar.back.service.StockTimeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping("/time/stocks")
public class StockTimeController {

    private final StockTimeService stockTimeService;

    public StockTimeController(StockTimeService stockTimeService) {
        this.stockTimeService = stockTimeService;
    }

    // 예: /time/stocks/daily-time-candles?stockCode=005930
    @GetMapping("/daily-time-candles")
    public List<DailyTimeCandleDto> getDailyTimeCandles(@RequestParam String stockCode) {
        return stockTimeService.getDailyTimeCandles(stockCode);
    }
}
package com.yar.back.controller;

import com.yar.back.dto.YmwdCandleDto;
import com.yar.back.service.YmwdCandleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/time/stocks")
public class YmwdCandleController {

    private final YmwdCandleService ymwdCandleService;

    public YmwdCandleController(YmwdCandleService ymwdCandleService) {
        this.ymwdCandleService = ymwdCandleService;
    }

    // 일봉
    @GetMapping("/day")
    public List<YmwdCandleDto> getDailyPrice(
            @RequestParam String stockCode,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        return ymwdCandleService.getPricesByPeriod(stockCode, startDate, endDate, "D");
    }

    // 주봉
    @GetMapping("/week")
    public List<YmwdCandleDto> getWeeklyPrice(
            @RequestParam String stockCode,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        return ymwdCandleService.getPricesByPeriod(stockCode, startDate, endDate, "W");
    }

    // 월봉
    @GetMapping("/month")
    public List<YmwdCandleDto> getMonthlyPrice(
            @RequestParam String stockCode,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        return ymwdCandleService.getPricesByPeriod(stockCode, startDate, endDate, "M");
    }

    // 년봉
    @GetMapping("/year")
    public List<YmwdCandleDto> getYearlyPrice(
            @RequestParam String stockCode,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        return ymwdCandleService.getPricesByPeriod(stockCode, startDate, endDate, "Y");
    }
}

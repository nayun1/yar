package com.yar.back.controller;

import com.yar.back.dto.StockDetailDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.yar.back.service.KisService;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/stock")
public class StockDetailController {

    private KisService kisService;

    public StockDetailController(KisService kisService) {
        this.kisService = kisService;
    }

    @GetMapping("/{code}")
    public Mono<StockDetailDTO> getStockDetail(@PathVariable String code) {
        return kisService.getStockDetailByCode(code);
    }

}

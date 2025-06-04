package com.yar.back.controller;

import com.yar.back.dto.GetPeriodPriceOutputDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

public class GetPeriodPriceController {
    @PostMapping("/period-price")
    public ResponseEntity<Void> checkPeriodPriceData(@RequestBody GetPeriodPriceOutputDTO dto) {
        System.out.println(dto); // 전체 DTO 출력
        if (dto.getOutput2() != null) {
            for (GetPeriodPriceOutputDTO.PeriodPriceCandle candle : dto.getOutput2()) {
                System.out.println("Candle: " + candle);
            }
        }
        return ResponseEntity.ok().build();
    }
}

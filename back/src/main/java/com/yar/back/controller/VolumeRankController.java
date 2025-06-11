package com.yar.back.controller;

import com.yar.back.dto.VolumeRankOutputDTO;
import com.yar.back.service.KisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class VolumeRankController {

    private final KisService kisService;

    @Autowired
    public VolumeRankController(KisService kisService) {
        this.kisService = kisService;
    }

    @GetMapping("/volume-rank")
    public Mono<List<VolumeRankOutputDTO>> getVolumeRank() {
        return kisService.getVolumeRank();
    }

    @GetMapping("/trading-value-rank")
    public Mono<List<VolumeRankOutputDTO>> getTradingValueRank() {
        return kisService.getTradingValueRank();
    }

    @GetMapping("/rise-rank")
    public Mono<List<VolumeRankOutputDTO>> getRiseRank() {
        return kisService.getRiseRank();
    }

    @GetMapping("/fall-rank")
    public Mono<List<VolumeRankOutputDTO>> getFallRank() {
        return kisService.getFallRank();
    }
}

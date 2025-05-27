package com.yar.back.controller;

import com.yar.back.dto.VolumeRankOutputDTO;
import com.yar.back.service.KisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
public class VolumeRankController {

    private KisService kisService;

    @Autowired
    public VolumeRankController(KisService kisService) {
        this.kisService = kisService;
    }

    @GetMapping("/volume-rank")
    public Mono<List<VolumeRankOutputDTO>> getVolumeRank() {
        return kisService.getVolumeRank();
    }
}
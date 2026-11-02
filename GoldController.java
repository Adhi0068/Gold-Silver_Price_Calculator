package com.gold.controller;


import com.gold.service.GoldService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/gold")
public class GoldController {

    private final GoldService service;

    public GoldController(GoldService service) {
        this.service = service;
    }

    @PostMapping("/set")
    public void setPrice(
            @RequestParam double price,
            @RequestParam double rate
    ) {
        service.setPriceAndRate(price, rate);
    }

    @GetMapping("/calculate")
    public double calculate(@RequestParam double weight) {
        return service.calculate(weight);
    }

    @GetMapping("/current")
    public Object current() {
        return service.getCurrentData();
    }
}

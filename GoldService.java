package com.gold.service;

import org.springframework.stereotype.Service;

@Service
public class GoldService {

    private final GoldPriceStore store;

    public GoldService(GoldPriceStore store) {
        this.store = store;
    }

    public void setPriceAndRate(double price, double rate) {
        store.set(price, rate);
    }

    public double calculate(double weight) {

        if (!store.isSet()) {
            return 0;
        }

        double base = store.getPrice() * weight;
        double rateAmount = base * (store.getRate() / 100);

        return base + rateAmount;
    }

    public double getCurrentPrice() {
        return store.getPrice();
    }

    public double getCurrentRate() {
        return store.getRate();
    }

    public Object getCurrentData() {
        return new Object() {
            public final double price = store.getPrice();
            public final double rate = store.getRate();
            public final Object lastUpdated = store.getLastUpdated();
        };
    }
}

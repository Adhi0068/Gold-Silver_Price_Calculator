package com.gold.service;

import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;

@Component
public class GoldPriceStore {

    private static final Path FILE = Path.of("gold-price.txt");

    private double price;
    private double rate;
    private LocalDateTime lastUpdated;

    @PostConstruct
    public void load() {

        try {

            if (!Files.exists(FILE)) {
                Files.writeString(FILE, "0|0|" + LocalDateTime.now());
            }

            String data = Files.readString(FILE);
            String[] parts = data.split("\\|");

            price = Double.parseDouble(parts[0]);
            rate = Double.parseDouble(parts[1]);
            lastUpdated = LocalDateTime.parse(parts[2]);

        } catch (Exception e) {
            price = 0;
            rate = 0;
            lastUpdated = LocalDateTime.now();
        }
    }

    public void set(double price, double rate) {

        this.price = price;
        this.rate = rate;
        this.lastUpdated = LocalDateTime.now();

        save();
    }

    private void save() {

        try {

            String data =
                    price + "|" +
                    rate + "|" +
                    lastUpdated;

            Files.writeString(FILE, data);

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public double getPrice() {
        return price;
    }

    public double getRate() {
        return rate;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public boolean isSet() {
        return price > 0;
    }
}

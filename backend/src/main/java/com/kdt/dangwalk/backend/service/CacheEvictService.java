package com.kdt.dangwalk.backend.service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import jakarta.annotation.PostConstruct;

@Component
@RequiredArgsConstructor
public class CacheEvictService {
    private final WeatherService weatherService;

    @PostConstruct
    public void init() {
        new Thread(() -> {
            try { weatherService.getWeather(36.8151, 127.1138, false); } catch (Exception e) {}
        }).start();
    }

    @CacheEvict(value = "weatherCache", allEntries = true)
    @Scheduled(cron = "0 5 * * * *") 
    public void refresh() {
        new Thread(() -> {
            try { weatherService.getWeather(36.8151, 127.1138, true); } catch (Exception e) {}
        }).start();
    }
}
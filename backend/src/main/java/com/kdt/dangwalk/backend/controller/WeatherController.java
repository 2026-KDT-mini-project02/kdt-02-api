package com.kdt.dangwalk.backend.controller;

import com.kdt.dangwalk.backend.dto.WeatherResponseWrapper;
import com.kdt.dangwalk.backend.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {
    private final WeatherService service;

    @GetMapping
    public WeatherResponseWrapper weather(
            @RequestParam double lat, @RequestParam double lon,
            @RequestParam(required = false, defaultValue = "false") boolean refresh) throws Exception {
        return service.getWeather(lat, lon, refresh);
    }
}
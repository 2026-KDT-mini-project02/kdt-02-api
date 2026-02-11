package com.kdt.dangwalk.backend.controller;

import com.kdt.dangwalk.backend.dto.WeatherDto;
import com.kdt.dangwalk.backend.service.WeatherService;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/weather")

// React 개발서버에서 요청 허용 (CORS 문제 해결)
public class WeatherController {

    private final WeatherService service;

    public WeatherController(WeatherService service){
        this.service=service;
    }

    // React 요청 예:
    // /api/weather?lat=37.45&lon=126.7
    @GetMapping
    public WeatherDto weather(@RequestParam double lat,@RequestParam double lon) throws Exception{
        System.out.println("lat=" + lat + " lon=" + lon);
        return service.getWeather(lat,lon);
    }
}
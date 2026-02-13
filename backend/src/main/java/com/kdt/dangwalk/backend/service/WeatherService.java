package com.kdt.dangwalk.backend.service;

import com.kdt.dangwalk.backend.dto.WeatherResponseWrapper;
import com.kdt.dangwalk.backend.util.GridConverter;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class WeatherService {

    private final WeatherApiClient apiClient;

    @Caching(
        cacheable = { @Cacheable(value = "weatherCache", key = "#lat.toString() + '_' + #lon.toString()", condition = "!#refresh") },
        put = { @CachePut(value = "weatherCache", key = "#lat.toString() + '_' + #lon.toString()", condition = "#refresh") }
    )
    public WeatherResponseWrapper getWeather(double lat, double lon, boolean refresh) throws Exception {
        double[] fixed = normalize(lat, lon);
        int[] grid = GridConverter.toGrid(fixed[0], fixed[1]);

        return new WeatherResponseWrapper(
            lat, lon, System.currentTimeMillis(),
            apiClient.fetchAllData(fixed[0], fixed[1], grid[0], grid[1], getBaseDate(), getBaseTime())
        );
    }

    private double[] normalize(double lat, double lon) {
        if (lat >= 124 && lat <= 132) return new double[]{lon, lat};
        return new double[]{lat, lon};
    }

    private String getBaseDate() { return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")); }
    private String getBaseTime() { return LocalTime.now().minusMinutes(40).format(DateTimeFormatter.ofPattern("HH00")); }
}
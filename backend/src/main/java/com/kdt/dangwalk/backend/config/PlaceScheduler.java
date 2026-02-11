package com.kdt.dangwalk.backend.config;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.kdt.dangwalk.backend.service.PlaceGeocodeService;
import com.kdt.dangwalk.backend.service.PlaceIngestService;

@Component
public class PlaceScheduler {

    private final PlaceIngestService ingestService;
    private final PlaceGeocodeService geocodeService;

    public PlaceScheduler(PlaceIngestService ingestService, PlaceGeocodeService geocodeService) {
        this.ingestService = ingestService;
        this.geocodeService = geocodeService;
    }

    // 매달 1일 03:00 OpenAPI 적재
    @Scheduled(cron = "${app.schedule.ingest-cron:0 0 3 1 * *}", zone = "Asia/Seoul")
    public void ingestMonthly() {
        ingestService.ingest();
    }

    // 10분마다 위경도 조금씩 채우기
    @Scheduled(cron = "${app.schedule.geocode-cron:0 */10 * * * *}", zone = "Asia/Seoul")
    public void geocodeOften() {
        geocodeService.fillMissingLatLngOnce();
    }
}

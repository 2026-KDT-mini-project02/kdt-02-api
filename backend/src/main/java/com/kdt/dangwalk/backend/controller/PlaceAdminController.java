package com.kdt.dangwalk.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.kdt.dangwalk.backend.service.PlaceGeocodeService;
import com.kdt.dangwalk.backend.service.PlaceIngestService;

@RestController
@RequestMapping("/admin/place")
public class PlaceAdminController {

    private final PlaceIngestService ingestService;
    private final PlaceGeocodeService geocodeService;

    public PlaceAdminController(PlaceIngestService ingestService, PlaceGeocodeService geocodeService) {
        this.ingestService = ingestService;
        this.geocodeService = geocodeService;
    }

    @PostMapping("/ingest")
    public ResponseEntity<String> ingestNow() {
        int count = ingestService.ingest();
        return ResponseEntity.ok("ingest ok: " + count);
    }

    @PostMapping("/geocode")
    public ResponseEntity<String> geocodeOnce() {
        int updated = geocodeService.fillMissingLatLngOnce();
        return ResponseEntity.ok("geocode ok: " + updated);
    }
}

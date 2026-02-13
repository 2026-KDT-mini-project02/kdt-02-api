package com.kdt.dangwalk.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kdt.dangwalk.backend.dto.PlaceMarkerDto;
import com.kdt.dangwalk.backend.entity.PlaceEntity;
import com.kdt.dangwalk.backend.repository.PlaceRepository;

@RestController
@RequestMapping("/api/places")
public class PlaceController {

    private final PlaceRepository placeRepository;

    public PlaceController(PlaceRepository placeRepository) {
        this.placeRepository = placeRepository;
    }

    @GetMapping("/nearby")
    public List<PlaceMarkerDto> nearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "1000") int radius
    ) {
        List<PlaceEntity> list = placeRepository.findNearby(lat, lng, radius);

        return list.stream()
                .filter(p -> p.getLat() != null && p.getLng() != null)
                .map(p -> new PlaceMarkerDto(
                        p.getId(),
                        p.getName(),
                        p.getRoadAddress(),
                        p.getLat(),
                        p.getLng()
                ))
                .toList();
    }
}

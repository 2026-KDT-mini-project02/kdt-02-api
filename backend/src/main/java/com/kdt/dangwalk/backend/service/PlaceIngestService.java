package com.kdt.dangwalk.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kdt.dangwalk.backend.entity.PlaceEntity;
import com.kdt.dangwalk.backend.repository.PlaceRepository;

@Service
public class PlaceIngestService {

    private final PublicApiClient apiClient;
    private final PlaceJsonMapper mapper;
    private final PlaceRepository repo;

    private final ObjectMapper om = new ObjectMapper();

    @Value("${app.place.api-url}")
    private String apiUrl;

    @Value("${app.place.service-key}")
    private String serviceKey;

    @Value("${app.place.per-page:1000}")
    private int perPage;

    public PlaceIngestService(PublicApiClient apiClient, PlaceJsonMapper mapper, PlaceRepository repo) {
        this.apiClient = apiClient;
        this.mapper = mapper;
        this.repo = repo;
    }

    @Transactional
    public int ingest() {
        int totalCount = fetchTotalCount();
        if (totalCount <= 0) return 0;

        int lastPage = (totalCount + perPage - 1) / perPage; // 올림 계산(정수)
        int totalSavedOrUpdated = 0;

        for (int page = 1; page <= lastPage; page++) {
            String json = apiClient.fetchJson(apiUrl, serviceKey, page, perPage);
            List<PlaceEntity> items = mapper.mapToPlaces(json);

            for (PlaceEntity p : items) {
                repo.findByNameAndRoadAddress(p.getName(), p.getRoadAddress())
                    .ifPresentOrElse(existing -> {
                        existing.setCategory1(p.getCategory1());
                        existing.setCategory2(p.getCategory2());
                        existing.setCategory3(p.getCategory3());
                        existing.setLat(p.getLat());
                        existing.setLng(p.getLng());
                    }, () -> repo.save(p));

                totalSavedOrUpdated++;
            }
        }

        return totalSavedOrUpdated;
    }

    private int fetchTotalCount() {
        try {
            String json = apiClient.fetchJson(apiUrl, serviceKey, 1, 1);
            JsonNode root = om.readTree(json);
            return root.path("totalCount").asInt(0);
        } catch (com.fasterxml.jackson.core.JsonProcessingException
                | org.springframework.web.client.RestClientException e) {
            return 0;
        }
    }
}

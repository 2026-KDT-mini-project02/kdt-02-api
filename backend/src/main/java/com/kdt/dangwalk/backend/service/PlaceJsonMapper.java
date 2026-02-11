package com.kdt.dangwalk.backend.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kdt.dangwalk.backend.entity.PlaceEntity;

@Service
public class PlaceJsonMapper {

    private final ObjectMapper om = new ObjectMapper();

    public List<PlaceEntity> mapToPlaces(String json) {
        try {
            if (json == null || json.isBlank()) return List.of();

            JsonNode root = om.readTree(json);
            JsonNode data = root.path("data");
            if (!data.isArray()) return List.of();

            Map<String, PlaceEntity> dedup = new LinkedHashMap<>();

            for (JsonNode row : data) {
                String name = text(row, "시설명");
                String addr = text(row, "도로명주소");
                if (name.isEmpty() || addr.isEmpty()) continue;

                PlaceEntity p = new PlaceEntity();
                p.setName(name);
                p.setRoadAddress(addr);

                p.setCategory1(text(row, "카테고리1"));
                p.setCategory2(text(row, "카테고리2"));
                p.setCategory3(text(row, "카테고리3"));

                p.setLat(parseDoubleOrNull(text(row, "위도")));
                p.setLng(parseDoubleOrNull(text(row, "경도")));

                dedup.put(name + "||" + addr, p);
            }

            return new ArrayList<>(dedup.values());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("JSON parsing failed", e);
        }
    }

    private String text(JsonNode row, String key) {
        JsonNode v = row.get(key);
        return (v == null || v.isNull()) ? "" : v.asText("").trim();
    }

    private Double parseDoubleOrNull(String v) {
        try {
            return (v == null || v.trim().isEmpty()) ? null : Double.parseDouble(v.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}

package com.kdt.dangwalk.backend.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class PublicApiClient {

    private final RestTemplate restTemplate;

    public PublicApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // 공공데이터 API 호출 (날씨/장소 등) 해야함
    public String fetchPlaces(String keyword) {
        restTemplate.toString(); // 경고 제거용 더미 사용
        return null;
    }
}

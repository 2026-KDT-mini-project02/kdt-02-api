package com.kdt.dangwalk.backend.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class KakaoGeocodeClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper om = new ObjectMapper();

    @Value("${kakao.rest-api-key}")
    private String kakaoKey;

    public KakaoGeocodeClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public LatLng geocode(String roadAddress) {
        if (roadAddress == null || roadAddress.trim().isEmpty()) return null;

        try {
            String q = URLEncoder.encode(roadAddress, StandardCharsets.UTF_8);
            String url = "https://dapi.kakao.com/v2/local/search/address.json?query=" + q;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoKey);

            ResponseEntity<String> res = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), String.class);

            if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) return null;

            JsonNode root = om.readTree(res.getBody());
            JsonNode docs = root.path("documents");
            if (!docs.isArray() || docs.isEmpty()) return null;

            JsonNode first = docs.get(0);
            String x = first.path("x").asText(""); // lng
            String y = first.path("y").asText(""); // lat
            if (x.isEmpty() || y.isEmpty()) return null;

            return new LatLng(Double.parseDouble(y), Double.parseDouble(x));

        } catch (RestClientException | JsonProcessingException | NumberFormatException e) {
            return null;
        }
    }

    public record LatLng(double lat, double lng) {}
}

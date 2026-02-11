package com.kdt.dangwalk.backend.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class PublicApiClient {

    private final RestTemplate restTemplate;

    public PublicApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String fetchJson(String apiUrl, String serviceKey, int page, int perPage) {
        if (apiUrl == null || apiUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("api url is empty");
        }
        if (serviceKey == null || serviceKey.trim().isEmpty()) {
            throw new IllegalArgumentException("serviceKey is empty");
        }

        String encodedKey = URLEncoder.encode(serviceKey, StandardCharsets.UTF_8);

        String url = apiUrl
                + "?page=" + page
                + "&perPage=" + perPage
                + "&returnType=JSON"
                + "&serviceKey=" + encodedKey;

        try {
            return restTemplate.getForObject(url, String.class);
        } catch (RestClientException e) {
            throw new IllegalStateException("Public API request failed: " + url, e);
        }
    }
}

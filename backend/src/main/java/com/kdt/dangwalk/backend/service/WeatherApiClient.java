package com.kdt.dangwalk.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kdt.dangwalk.backend.dto.WeatherDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.net.URI;
import java.net.URLEncoder;
import java.time.LocalDate;
import java.util.concurrent.CompletableFuture;

@Component
@RequiredArgsConstructor
public class WeatherApiClient {

    private final String weatherKey = "2ba303a8ffe3577c0bced9317449c8fcb1d018321f43ccd2be14cd9a3faa61f7";
    private final String weatherApiUrl = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";

    @Value("${dust.api.url}") private String airApiUrl;
    @Value("${dust.serviceKey}") private String airServiceKey;
    @Value("${kakao.rest-api-key}") private String kakaoRestKey;

    public WeatherDto fetchAllData(double lat, double lon, int nx, int ny, String baseDate, String baseTime) {
        CompletableFuture<String> locationFuture = CompletableFuture.supplyAsync(() -> getLocationName(lat, lon));
        
        CompletableFuture<JsonNode> weatherFuture = CompletableFuture.supplyAsync(() -> {
            try {
                String url = weatherApiUrl + "?serviceKey=" + weatherKey + "&numOfRows=100&pageNo=1&dataType=JSON"
                        + "&base_date=" + baseDate + "&base_time=" + baseTime + "&nx=" + nx + "&ny=" + ny;
                return new ObjectMapper().readTree(new RestTemplate().getForObject(url, String.class))
                        .path("response").path("body").path("items").path("item");
            } catch (Exception e) { return null; }
        });

        CompletableFuture<String[]> dustFuture = locationFuture.thenApplyAsync(location -> getDustStatus(location.split(" ")[0]));

        CompletableFuture.allOf(locationFuture, weatherFuture, dustFuture).join();

        try {
            WeatherDto dto = new WeatherDto();
            dto.setDate(LocalDate.now().toString());
            dto.setLocation(locationFuture.get());
            
            String[] dusts = dustFuture.get();
            dto.setDust(dusts[0]);
            dto.setUltraDust(dusts[1]);

            JsonNode items = weatherFuture.get();
            if (items != null) {
                for (JsonNode node : items) {
                    String cat = node.get("category").asText();
                    String val = node.get("obsrValue").asText();
                    if (cat.equals("T1H")) dto.setTemp(Double.parseDouble(val));
                    else if (cat.equals("PTY")) {
                        dto.setSky(convertRainSky(Integer.parseInt(val)));
                        dto.setIcon(convertIcon(dto.getSky()));
                    }
                }
            }
            return dto;
        } catch (Exception e) { throw new RuntimeException(e); }
    }

    private String getLocationName(double lat, double lon) {
        try {
            String url = "https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=" + lon + "&y=" + lat;
            RestTemplate rt = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoRestKey);
            ResponseEntity<String> res = rt.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            JsonNode region = new ObjectMapper().readTree(res.getBody()).path("documents").get(0);
            return region.path("region_1depth_name").asText() + " " + region.path("region_2depth_name").asText();
        } catch (Exception e) { return "현재 위치"; }
    }

    private String[] getDustStatus(String sidoName) {
        try {
            String url = airApiUrl + "/getCtprvnRltmMesureDnsty?serviceKey=" + airServiceKey 
                    + "&returnType=json&numOfRows=1&pageNo=1&sidoName=" 
                    + URLEncoder.encode(sidoName.substring(0, 2), "UTF-8") + "&ver=1.3";
            JsonNode item = new ObjectMapper().readTree(new RestTemplate().getForObject(new URI(url), String.class))
                    .path("response").path("body").path("items").get(0);
            return new String[]{
                parseGrade(item.path("pm10Value").asText(), 30, 80, 150),
                parseGrade(item.path("pm25Value").asText(), 15, 35, 75)
            };
        } catch (Exception e) { return new String[]{"보통", "보통"}; }
    }

    private String parseGrade(String val, int g, int n, int b) {
        try {
            int v = Integer.parseInt(val.replace("-", "0"));
            if (v <= g) return "좋음"; if (v <= n) return "보통"; if (v <= b) return "나쁨"; return "매우 나쁨";
        } catch (Exception e) { return "보통"; }
    }

    private String convertRainSky(int rain) {
        return switch (rain) {
            case 0 -> "맑음"; case 1 -> "비"; case 2 -> "비/눈"; case 3 -> "눈"; default -> "흐림";
        };
    }

    private String convertIcon(String sky) {
        return switch (sky) {
            case "맑음" -> "sun"; case "비" -> "rain"; case "눈" -> "snow"; default -> "cloud";
        };
    }
}
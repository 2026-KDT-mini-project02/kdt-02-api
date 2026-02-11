package com.kdt.dangwalk.backend.service;

import org.springframework.cache.annotation.Cacheable;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kdt.dangwalk.backend.dto.WeatherDto;
import com.kdt.dangwalk.backend.util.GridConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.beans.factory.annotation.Value;
import java.util.concurrent.CompletableFuture;

@Service
@Cacheable(value = "weatherCache", key = "#lat.toString() + '_' + #lon.toString()") // 바로 이 부분!
public class WeatherService {

    // 기상청 API
    private final String key = "2ba303a8ffe3577c0bced9317449c8fcb1d018321f43ccd2be14cd9a3faa61f7";
    private final String apiUrl = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";

    @Value("${dust.api.url}")
    private String airApiUrl;

    @Value("${dust.serviceKey}")
    private String airServiceKey;

    @Value("${kakao.rest-api-key}")
    private String kakaoRestKey;

    @Cacheable(value = "weatherCache", key = "#lat.toString() + '_' + #lon.toString()")
    public WeatherDto getWeather(double lat, double lon) throws Exception {

        // 1. 좌표 보정 및 격자 변환
        double[] fixed = normalizeLatLon(lat, lon);
        double finalLat = fixed[0];
        double finalLon = fixed[1];

        int[] grid = GridConverter.toGrid(finalLat, finalLon);
        int nx = grid[0];
        int ny = grid[1];

        // 2. [비동기 시작] 카카오 위치 정보와 기상청 날씨 정보를 동시에 호출
        CompletableFuture<String> locationFuture = CompletableFuture.supplyAsync(() -> 
            getLocationName(finalLat, finalLon)
        );

        CompletableFuture<JsonNode> weatherFuture = CompletableFuture.supplyAsync(() -> {
            try {
                String url = apiUrl
                        + "?serviceKey=" + key
                        + "&numOfRows=100&pageNo=1&dataType=JSON"
                        + "&base_date=" + getBaseDate()
                        + "&base_time=" + getBaseTime()
                        + "&nx=" + nx
                        + "&ny=" + ny;

                RestTemplate rt = new RestTemplate();
                String json = rt.getForObject(url, String.class);
                ObjectMapper mapper = new ObjectMapper();
                return mapper.readTree(json).path("response").path("body").path("items").path("item");
            } catch (Exception e) {
                return null;
            }
        });

        // 3. [연쇄 비동기] 위치 정보가 오면 즉시 미세먼지 API 호출 시작
        CompletableFuture<String> dustFuture = locationFuture.thenApplyAsync(locationName -> {
            String fullSidoName = locationName.split(" ")[0];
            return getDustStatusBySido(fullSidoName);
        });

        // 4. 모든 API 응답이 올 때까지 대기 (가장 느린 API 기준으로 로딩 시간 단축)
        CompletableFuture.allOf(locationFuture, weatherFuture, dustFuture).join();

        // 5. 데이터 조합 및 DTO 생성
        WeatherDto dto = new WeatherDto();
        dto.setDate(java.time.LocalDate.now().toString());
        
        String locationName = locationFuture.get();
        dto.setLocation(locationName);
        dto.setDust(dustFuture.get());

        JsonNode items = weatherFuture.get();
        double temp = 0;
        int rain = 0;

        if (items != null) {
            for (JsonNode node : items) {
                String category = node.get("category").asText();
                String value = node.get("obsrValue").asText();
                switch (category) {
                    case "T1H": temp = Double.parseDouble(value); break;
                    case "PTY": rain = Integer.parseInt(value); break;
                }
            }
        }

        String skyText = convertRainSky(rain);
        dto.setTemp(temp);
        dto.setSky(skyText);
        dto.setIcon(convertIcon(skyText));

        return dto;
    }
    // ---------------------- 헬퍼 메서드 ----------------------

    // 좌표 한국 범위 확인 및 자동 교정
    private double[] normalizeLatLon(double lat, double lon) {
        if (!isKoreaLatLon(lat, lon) && isKoreaLatLon(lon, lat)) {
            return new double[]{lon, lat};
        }
        return new double[]{lat, lon};
    }

    private boolean isKoreaLatLon(double lat, double lon) {
        return lat >= 33 && lat <= 38 && lon >= 124 && lon <= 132;
    }

    private String getBaseDate() {
        return java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
    }

    private String getBaseTime() {
        java.time.LocalTime now = java.time.LocalTime.now().minusMinutes(40);
        return now.format(java.time.format.DateTimeFormatter.ofPattern("HH00"));
    }

    private String convertRainSky(int rain) {
        switch (rain) {
            case 0: return "맑음";
            case 1: return "비";
            case 2: return "비/눈";
            case 3: return "눈";
            case 5: return "빗방울";
            case 6: return "빗방울/눈날림";
            case 7: return "눈날림";
            default: return "알수없음";
        }
    }

    private String convertIcon(String sky) {
        switch (sky) {
            case "맑음": return "sun";
            case "비": return "rain";
            case "눈": return "snow";
            case "비/눈": return "sleet";
            case "흐림": return "cloud";
            default: return "cloud";
        }
    }
    // 소수점 5자리 반올림
   private double round5(double value) {
    return Math.round(value * 100000) / 100000.0;
}
    // ---------------------- 카카오 역지오코딩 ----------------------
    private String getLocationName(double lat, double lon) {
        // 소수점 5자리 반올림
    lat = round5(lat);
    lon = round5(lon);
        try {
            String url = "https://dapi.kakao.com/v2/local/geo/coord2regioncode.json"
                    + "?x=" + lon
                    + "&y=" + lat;

            RestTemplate rt = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoRestKey);
            HttpEntity<?> entity = new HttpEntity<>(headers);

            ResponseEntity<String> res = rt.exchange(url, HttpMethod.GET, entity, String.class);

            //json 확인
            System.out.println(res.getBody());

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(res.getBody());
            JsonNode documents = root.path("documents");

            if (documents.isEmpty()) return "현재 위치";

            JsonNode region = documents.get(0);
            String depth1 = region.path("region_1depth_name").asText(); // 시/도
            String depth2 = region.path("region_2depth_name").asText(); // 구/군

            if (!depth1.isEmpty() && !depth2.isEmpty())
                return depth1 + " " + depth2;
            if (!depth1.isEmpty())
                return depth1;

            return "현재 위치";

        } catch (Exception e) {
            e.printStackTrace(); // 에러 로그 출력
            return "현재 위치";
        }
    }
private String getDustStatusBySido(String fullSidoName) {
    try {
        String shortSido = convertToShortSido(fullSidoName);
        
        // 1. 전체 URL 문자열 생성 (이미 인코딩된 '일반 인증키'를 그대로 사용한다고 가정)
        String urlStr = airApiUrl + "/getCtprvnRltmMesureDnsty" 
                + "?serviceKey=" + airServiceKey 
                + "&returnType=json&numOfRows=10&pageNo=1"
                + "&sidoName=" + java.net.URLEncoder.encode(shortSido, "UTF-8") 
                + "&ver=1.3";

        // 2. [핵심] 문자열을 URI 객체로 변환 (RestTemplate의 자동 인코딩을 막아줌)
        java.net.URI uri = new java.net.URI(urlStr);

        RestTemplate rt = new RestTemplate();
        // 3. urlStr 대신 uri 객체를 전달
        String rawResponse = rt.getForObject(uri, String.class); 
        
        System.out.println(">>> 에어코리아 응답: " + rawResponse);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(rawResponse);
        
        // items 배열 추출
        JsonNode items = root.path("response").path("body").path("items");
        
        if (items.isArray() && items.size() > 0) {
            JsonNode firstItem = items.get(0);
            String pm10Val = firstItem.path("pm10Value").asText();
            
            // [확인 2] 실제 JSON에서 뽑아낸 pm10Value 값 확인
            System.out.println(">>> 추출된 pm10Value: [" + pm10Val + "]");
            
            if (pm10Val.equals("-") || pm10Val.isEmpty()) return "보통";
            
            int value = Integer.parseInt(pm10Val);
            String result = "";

            if (value <= 30) result = "좋음";
            else if (value <= 80) result = "보통";
            else if (value <= 150) result = "나쁨";
            else result = "매우 나쁨";

            // [확인 3] 최종적으로 결정된 4단계 문자열 확인
            System.out.println(">>> 최종 Dust 상태: " + result);
            return result;
        } else {
            System.out.println(">>> 에어코리아 응답에 items가 없습니다.");
            return "보통";
        }
        
    } catch (Exception e) {
        System.out.println(">>> 에어코리아 데이터 가져오기 실패: " + e.getMessage());
        e.printStackTrace(); // 구체적인 에러 원인 출력
        return "보통"; 
    }
}

// [로직 2] 에어코리아 API용 짧은 시/도 명칭 변환기
private String convertToShortSido(String sido) {
    if (sido.contains("서울")) return "서울";
    if (sido.contains("부산")) return "부산";
    if (sido.contains("대구")) return "대구";
    if (sido.contains("인천")) return "인천";
    if (sido.contains("광주")) return "광주";
    if (sido.contains("대전")) return "대전";
    if (sido.contains("울산")) return "울산";
    if (sido.contains("세종")) return "세종";
    if (sido.contains("경기")) return "경기";
    if (sido.contains("강원")) return "강원";
    if (sido.contains("충청북")) return "충북";
    if (sido.contains("충청남")) return "충남";
    if (sido.contains("전라북")) return "전북";
    if (sido.contains("전라남")) return "전남";
    if (sido.contains("경상북")) return "경북";
    if (sido.contains("경상남")) return "경남";
    if (sido.contains("제주")) return "제주";
    return "서울"; // 매칭 실패 시 기본값
}
    
}
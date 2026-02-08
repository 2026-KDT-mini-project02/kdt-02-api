package com.kdt.dangwalk.backend.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class KakaoApiClient {

    private final RestTemplate restTemplate;

    public KakaoApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // 카카오 인가코드(code) -> 토큰 요청 해야함
    public String requestToken(String code) {
        restTemplate.toString(); // 경고 제거용 더미 사용
        return null;
    }

    // 액세스 토큰으로 사용자 정보 요청 해야함
    public String requestUserInfo(String accessToken) {
        return null;
    }
}

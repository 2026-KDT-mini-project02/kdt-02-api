package com.kdt.dangwalk.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.kdt.dangwalk.backend.client.KakaoApiClient;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final KakaoApiClient kakaoApiClient;

    public AuthController(KakaoApiClient kakaoApiClient) {
        this.kakaoApiClient = kakaoApiClient;
    }

    // 예: /auth/kakao/callback?code=xxxx
    @GetMapping("/kakao/callback")
    public ResponseEntity<String> kakaoCallback(@RequestParam String code) {
        kakaoApiClient.toString(); // 경고 제거용 더미 사용
        return ResponseEntity.ok("ok");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        // 로그아웃 처리(세션/토큰 정리) 해야함
        return ResponseEntity.ok("logout");
    }
}
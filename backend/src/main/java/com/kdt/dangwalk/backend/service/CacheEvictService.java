package com.kdt.dangwalk.backend.service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import jakarta.annotation.PostConstruct;

@Component
@RequiredArgsConstructor
public class CacheEvictService {

    private final WeatherService weatherService;

    // [1] 서버가 뜨자마자 실행 (초기 로딩 속도 해결)
    @PostConstruct
    public void init() {
        System.out.println(">>> [Startup] 서버 시작! 데이터를 미리 가져옵니다...");
        // 여기서 직접 부르면 비동기가 안 먹힐 수 있으니 
        // 서비스의 메서드를 직접 호출하거나 별도 스레드로 던집니다.
        new Thread(() -> {
            try {
                weatherService.getWeather(36.8151, 127.1138);
                System.out.println(">>> [Startup] 초기 데이터 캐싱 완료!");
            } catch (Exception e) {
                System.err.println(">>> [Startup] 초기 로딩 실패: " + e.getMessage());
            }
        }).start();
    }

    // [2] 매시 5분 정기 업데이트
    @CacheEvict(value = "weatherCache", allEntries = true)
    @Scheduled(cron = "0 5 * * * *") 
    public void refreshWeatherCache() {
        System.out.println(">>> [정기 업데이트] 캐시 삭제 완료. 최신화 시작...");
        
        // [주의] 이 내부에서 @Async 메서드를 부르면 비동기로 작동 안 함(Self-invocation 문제)
        // 안전하게 별도 스레드로 처리
        new Thread(() -> {
            try {
                weatherService.getWeather(36.8151, 127.1138);
                System.out.println(">>> [Update] 최신 데이터로 캐시 채우기 성공!");
            } catch (Exception e) {
                System.err.println(">>> [Update] 데이터 갱신 실패");
            }
        }).start();
    }
}

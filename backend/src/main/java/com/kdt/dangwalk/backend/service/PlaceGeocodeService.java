package com.kdt.dangwalk.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kdt.dangwalk.backend.entity.PlaceEntity;
import com.kdt.dangwalk.backend.repository.PlaceRepository;
import com.kdt.dangwalk.backend.service.KakaoGeocodeClient.LatLng;

@Service
public class PlaceGeocodeService {

    private final PlaceRepository repo;
    private final KakaoGeocodeClient kakao;

    @Value("${app.geocode.batch-size:30}")
    private int batchSize;

    @Value("${app.geocode.sleep-ms:150}")
    private long sleepMs;

    public PlaceGeocodeService(PlaceRepository repo, KakaoGeocodeClient kakao) {
        this.repo = repo;
        this.kakao = kakao;
    }

    @Transactional
    public int fillMissingLatLngOnce() {
        List<PlaceEntity> targets = repo.findNeedGeocode(PageRequest.of(0, batchSize));

        int updated = 0;

        for (PlaceEntity p : targets) {
            String addr = p.getRoadAddress();
            if (addr == null || addr.trim().isEmpty()) continue;

            LatLng latLng = kakao.geocode(addr);
            if (latLng != null) {
                p.setLat(latLng.lat());
                p.setLng(latLng.lng());
                updated++;
            }

            throttle();
        }

        return updated;
    }

    private void throttle() {
        if (sleepMs <= 0) return;
        try {
            Thread.sleep(sleepMs);
        } catch (InterruptedException ignored) {
            // 배치 성격상 무시
        }
    }
}

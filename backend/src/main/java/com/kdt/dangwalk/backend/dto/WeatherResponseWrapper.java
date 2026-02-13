package com.kdt.dangwalk.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WeatherResponseWrapper implements Serializable {
    private double lat;
    private double lon;
    private long at;              // 캐시 생성 시간
    private WeatherDto data;      // 실제 날씨 정보
}

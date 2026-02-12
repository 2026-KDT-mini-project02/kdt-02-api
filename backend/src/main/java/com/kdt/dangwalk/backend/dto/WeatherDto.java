package com.kdt.dangwalk.backend.dto;

import lombok.Data;
import java.io.Serializable;
@Data
public class WeatherDto implements Serializable {

    private String date;
    private String location;

    private double temp;

    private String sky;
    private String icon;

    private String dust;      // 프론트의 weather.dust와 매칭
    private String ultraDust; // 프론트의 weather.ultraDust와 매칭
}

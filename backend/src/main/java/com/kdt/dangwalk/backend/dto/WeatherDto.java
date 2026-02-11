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

    private String dust;
}

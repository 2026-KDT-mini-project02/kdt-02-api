package com.kdt.dangwalk.backend.dto;

public class PlaceMarkerDto {
    private Long id;
    private String name;
    private String roadAddress;
    private Double lat;
    private Double lng;

    public PlaceMarkerDto(Long id, String name, String roadAddress, Double lat, Double lng) {
        this.id = id;
        this.name = name;
        this.roadAddress = roadAddress;
        this.lat = lat;
        this.lng = lng;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getRoadAddress() { return roadAddress; }
    public Double getLat() { return lat; }
    public Double getLng() { return lng; }
}

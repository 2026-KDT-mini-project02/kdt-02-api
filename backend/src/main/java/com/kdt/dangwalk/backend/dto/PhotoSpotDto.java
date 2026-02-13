package com.kdt.dangwalk.backend.dto;

import com.kdt.dangwalk.backend.entity.PhotoSpotEntity;

public class PhotoSpotDto {
    private Long id;
    private Double lat;
    private Double lng;
    private String imgUrl;

    public PhotoSpotDto(Long id, Double lat, Double lng, String imgUrl) {
        this.id = id;
        this.lat = lat;
        this.lng = lng;
        this.imgUrl = imgUrl;
    }

    public static PhotoSpotDto from(PhotoSpotEntity entity) {
        return new PhotoSpotDto(
                entity.getId(),
                entity.getLat(),
                entity.getLng(),
                entity.getImageUrl()
        );
    }

    public Long getId() {
        return id;
    }

    public Double getLat() {
        return lat;
    }

    public Double getLng() {
        return lng;
    }

    public String getImgUrl() {
        return imgUrl;
    }
}

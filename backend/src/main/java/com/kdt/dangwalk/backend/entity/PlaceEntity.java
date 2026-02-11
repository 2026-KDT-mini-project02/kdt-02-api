package com.kdt.dangwalk.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "place_tbl",
    uniqueConstraints = @UniqueConstraint(columnNames = {"name", "road_address"})
)
public class PlaceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, length=200)
    private String name; // 시설명

    @Column(name="road_address", nullable=false, length=500)
    private String roadAddress; // 도로명주소

    @Column(name="category1", length=100)
    private String category1;

    @Column(name="category2", length=100)
    private String category2;

    @Column(name="category3", length=100)
    private String category3;

    @Column(name="biz_status", length=50)
    private String bizStatus; // 영업상태(있으면 저장)

    @Column(name="lat")
    private Double lat;

    @Column(name="lng")
    private Double lng;

    public PlaceEntity() {}

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRoadAddress() { return roadAddress; }
    public void setRoadAddress(String roadAddress) { this.roadAddress = roadAddress; }

    public String getCategory1() { return category1; }
    public void setCategory1(String category1) { this.category1 = category1; }

    public String getCategory2() { return category2; }
    public void setCategory2(String category2) { this.category2 = category2; }

    public String getCategory3() { return category3; }
    public void setCategory3(String category3) { this.category3 = category3; }

    public String getBizStatus() { return bizStatus; }
    public void setBizStatus(String bizStatus) { this.bizStatus = bizStatus; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }
}

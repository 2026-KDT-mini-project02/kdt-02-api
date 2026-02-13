package com.kdt.dangwalk.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kdt.dangwalk.backend.entity.PhotoSpotEntity;

public interface PhotoSpotRepository extends JpaRepository<PhotoSpotEntity, Long> {
    List<PhotoSpotEntity> findByUser_UseridOrderByCreatedAtDesc(String userid);
}

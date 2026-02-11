package com.kdt.dangwalk.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.kdt.dangwalk.backend.entity.PlaceEntity;

public interface PlaceRepository extends JpaRepository<PlaceEntity, Long> {

    Optional<PlaceEntity> findByNameAndRoadAddress(String name, String roadAddress);

    @Query("""
        select p from PlaceEntity p
        where (p.lat is null or p.lng is null)
          and p.roadAddress is not null and p.roadAddress <> ''
    """)
    List<PlaceEntity> findNeedGeocode(Pageable pageable);
}

package com.kdt.dangwalk.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kdt.dangwalk.backend.entity.PlaceEntity;

public interface PlaceRepository extends JpaRepository<PlaceEntity, Long> {

    Optional<PlaceEntity> findByNameAndRoadAddress(String name, String roadAddress);

    // 지오코디 가져오는 메서드
    @Query("""
        select p from PlaceEntity p
        where (p.lat is null or p.lng is null)
          and p.roadAddress is not null and p.roadAddress <> ''
    """)
    List<PlaceEntity> findNeedGeocode(Pageable pageable);

    // 근처 장소 조회 메서드
    @Query(value = """
        SELECT *
        FROM place_tbl
        WHERE lat IS NOT NULL AND lng IS NOT NULL
        AND ST_Distance_Sphere(POINT(lng, lat), POINT(:lng, :lat)) <= :radius
        ORDER BY ST_Distance_Sphere(POINT(lng, lat), POINT(:lng, :lat))
        """, nativeQuery = true)
    List<PlaceEntity> findNearby(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radius") int radius
    );
}

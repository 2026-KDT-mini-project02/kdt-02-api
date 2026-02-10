package com.kdt.dangwalk.backend.repository;

import com.kdt.dangwalk.backend.entity.DogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DogRepository extends JpaRepository<DogEntity, Long> {
    // 특정 사용자가 등록한 강아지들만 찾고 싶을 때 사용
    List<DogEntity> findByUserid(String userid);
}
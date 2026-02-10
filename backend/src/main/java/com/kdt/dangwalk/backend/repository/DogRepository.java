// DogRepository.java
package com.kdt.dangwalk.backend.repository;

import com.kdt.dangwalk.backend.entity.DogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DogRepository extends JpaRepository<DogEntity, Long> {
    // 유저 아이디로 강아지 목록을 찾는 메소드 추가
    List<DogEntity> findByUserid(String userid);
}
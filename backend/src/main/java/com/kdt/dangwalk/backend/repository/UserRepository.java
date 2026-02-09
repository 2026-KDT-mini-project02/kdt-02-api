package com.kdt.dangwalk.backend.repository;

import com.kdt.dangwalk.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    // 중복 확인을 위해 아이디로 사용자 찾기
    Optional<UserEntity> findByUserid(String userid);

    // 더 간단하게 존재 여부만 확인하기 (선택 사항)
    boolean existsByUserid(String userid);
}

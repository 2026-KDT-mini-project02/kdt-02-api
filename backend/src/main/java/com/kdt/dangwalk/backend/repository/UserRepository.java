package com.kdt.dangwalk.backend.repository;

import com.kdt.dangwalk.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional; // Optional 임포트

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    boolean existsByUserid(String userid);

    // ✅ 이름과 이메일로 유저 정보를 찾는 쿼리 메소드 추가
    // 이 메소드가 있어야 DB에서 아이디를 긁어올 수 있습니다.

    Optional<UserEntity> findByUserid(String userid);
    Optional<UserEntity> findByNameAndEmail(String name, String email);
    Optional<UserEntity> findByUseridAndEmail(String userid, String email);
}

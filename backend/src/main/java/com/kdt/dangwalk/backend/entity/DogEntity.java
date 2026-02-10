package com.kdt.dangwalk.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "dog_tbl") // 생성하신 테이블 명과 일치
@Getter
@Setter
public class DogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment에 대응
    private Long id;

    @Column(nullable = false, length = 50)
    private String userid; // 주인 아이디 (varchar(50))

    @Column(nullable = false, length = 50)
    private String name; // 반려견 이름 (varchar(50))

    @Column(nullable = false, length = 100)
    private String breed; // 견종 (varchar(100))

    @Column(nullable = false)
    private Integer age; // 나이 (int)

    @Column(nullable = false)
    private Double weight; // 몸무게 (double)

    @Column(columnDefinition = "TEXT")
    private String description; // 소개글 (text)

    // DB에서 CURRENT_TIMESTAMP로 자동 생성되므로 insertable = false 설정
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
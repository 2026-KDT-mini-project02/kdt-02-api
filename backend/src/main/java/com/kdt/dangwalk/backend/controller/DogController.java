package com.kdt.dangwalk.backend.controller;

import com.kdt.dangwalk.backend.entity.DogEntity;
import com.kdt.dangwalk.backend.repository.DogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/dog")
public class DogController {

  private final DogRepository dogRepository;

  public DogController(DogRepository dogRepository) {
    this.dogRepository = dogRepository;
  }

  @PostMapping("/register")
  public ResponseEntity<String> registerDog(@RequestBody DogEntity dogEntity) {
    try {
      // 리액트에서 보낸 강아지 정보(userid, name, breed 등)가 dogEntity에 자동으로 담깁니다.
      System.out.println("강아지 등록 시도: " + dogEntity.getName() + " (주인: " + dogEntity.getUserid() + ")");

      dogRepository.save(dogEntity); // DB에 저장!

      return ResponseEntity.ok("반려견 등록이 완료되었습니다!");
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.status(500).body("등록 중 오류 발생: " + e.getMessage());
    }
  }
}

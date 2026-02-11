package com.kdt.dangwalk.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kdt.dangwalk.backend.entity.DogEntity;
import com.kdt.dangwalk.backend.repository.DogRepository;

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

    @GetMapping("/list")
    public ResponseEntity<List<DogEntity>> getDogList(@RequestParam String userid) {
        // 해당 유저아이디를 가진 강아지들만 찾아오기
        List<DogEntity> dogs = dogRepository.findByUserid(userid);
        return ResponseEntity.ok(dogs);
    }

    // ✅ 반려견 수정
    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateDog(@PathVariable Long id, @RequestBody DogEntity dogEntity) {
        try {
            System.out.println("반려견 수정 시도 - ID: " + id);

            // DB에서 해당 ID의 반려견 찾기
            return dogRepository.findById(id)
                    .map(existingDog -> {
                        // 기존 반려견 정보 업데이트
                        existingDog.setName(dogEntity.getName());
                        existingDog.setBreed(dogEntity.getBreed());
                        existingDog.setAge(dogEntity.getAge());
                        existingDog.setWeight(dogEntity.getWeight());
                        existingDog.setDescription(dogEntity.getDescription());

                        dogRepository.save(existingDog);
                        return ResponseEntity.ok("반려견 정보가 수정되었습니다!");
                    })
                    .orElse(ResponseEntity.status(404).body("해당 반려견을 찾을 수 없습니다."));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("수정 중 오류 발생: " + e.getMessage());
        }
    }

    // ✅ 반려견 삭제
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteDog(@PathVariable Long id) {
        try {
            System.out.println("반려견 삭제 시도 - ID: " + id);

            // DB에서 해당 ID의 반려견이 존재하는지 확인
            if (dogRepository.existsById(id)) {
                dogRepository.deleteById(id);
                return ResponseEntity.ok("반려견 정보가 삭제되었습니다.");
            } else {
                return ResponseEntity.status(404).body("해당 반려견을 찾을 수 없습니다.");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("삭제 중 오류 발생: " + e.getMessage());
        }
    }
}
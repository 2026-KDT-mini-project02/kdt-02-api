package com.kdt.dangwalk.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kdt.dangwalk.backend.dto.LoginRequest;
import com.kdt.dangwalk.backend.dto.UserDTO;
import com.kdt.dangwalk.backend.entity.UserEntity;
import com.kdt.dangwalk.backend.repository.UserRepository;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/check-id")
    public ResponseEntity<Boolean> checkId(@RequestParam("userId") String userid) {
        // 1. 요청이 들어왔는지 확인하는 로그 (터미널에서 확인용)
        System.out.println("아이디 중복 확인 요청 들어옴: " + userid);

        // 2. DB에서 아이디 존재 여부 확인 (있으면 true, 없으면 false)
        boolean isDuplicate = userRepository.existsByUserid(userid);

        // 3. 결과 로그 찍기
        System.out.println("중복 여부 결과: " + isDuplicate);

        // 4. 리액트에게 true/false를 그대로 전달
        // 리액트에서 data === false 면 "사용 가능"으로 인식함
        return ResponseEntity.ok(isDuplicate);
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestBody UserDTO dto) {
        // 1) 아이디 중복 체크
        if (userRepository.existsByUserid(dto.getUserid())) {
            return ResponseEntity.status(409).body("이미 사용 중인 아이디입니다.");
        }

        // 2) DTO -> Entity 변환 (생성자 사용)
        UserEntity userEntity = new UserEntity(
            dto.getName(),
            dto.getUserid(),
            dto.getPassword(),
            dto.getEmail(),
            dto.getPhonenumber(),
            dto.isAgreeservice(),
            dto.isAgreeprivacy()
        );

        userRepository.save(userEntity);
        return ResponseEntity.ok("회원가입이 완료되었습니다!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("로그인 시도 아이디: " + loginRequest.getUserid());
        return ResponseEntity.ok("로그인 시도 중입니다.");
    }
}
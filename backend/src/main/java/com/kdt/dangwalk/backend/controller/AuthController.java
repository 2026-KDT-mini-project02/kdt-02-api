package com.kdt.dangwalk.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.kdt.dangwalk.backend.repository.UserRepository;
import com.kdt.dangwalk.backend.client.KakaoApiClient;
import com.kdt.dangwalk.backend.entity.UserEntity;
import com.kdt.dangwalk.backend.dto.LoginRequest;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final KakaoApiClient kakaoApiClient;

    public AuthController(UserRepository userRepository, KakaoApiClient kakaoApiClient) {
        this.userRepository = userRepository;
        this.kakaoApiClient = kakaoApiClient;
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
    public ResponseEntity<String> signUp(@RequestBody UserEntity userEntity) {
        try {
            // [추가] 가입 데이터 확인 로그
            System.out.println("회원가입 시도 아이디: " + userEntity.getUserid());

            userRepository.save(userEntity);
            return ResponseEntity.ok("회원가입이 완료되었습니다!");
        } catch (Exception e) {
            // 에러 발생 시 로그를 찍어줘야 원인을 알 수 있습니다.
            e.printStackTrace();
            return ResponseEntity.status(500).body("회원가입 중 오류 발생: " + e.getMessage());
        }
    }

    @GetMapping("/kakao/callback")
    public ResponseEntity<String> kakaoCallback(@RequestParam String code) {
        return ResponseEntity.ok("ok");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // 이제 여기서 loginRequest.getUserid() 를 사용할 수 있습니다!
        System.out.println("로그인 시도 아이디: " + loginRequest.getUserid());

        // 임시 응답
        return ResponseEntity.ok("로그인 시도 중입니다.");
    }
}
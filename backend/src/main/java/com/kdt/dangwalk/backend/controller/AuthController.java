package com.kdt.dangwalk.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.kdt.dangwalk.backend.dto.LoginRequest;
import com.kdt.dangwalk.backend.dto.UserDTO;
import com.kdt.dangwalk.backend.entity.UserEntity;
import com.kdt.dangwalk.backend.repository.UserRepository;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // 회원가입 (DTO 받기 + BCrypt 적용)
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody UserDTO dto) {
        // 1) 아이디 중복 체크 (dev 내용)
        if (userRepository.existsByUserid(dto.getUserid())) {
            return ResponseEntity.status(409).body(Map.of("message", "이미 사용 중인 아이디입니다."));
        }

        // 2) 비밀번호 암호화 (ksy 내용)
        String encodedPw = passwordEncoder.encode(dto.getPassword());

        // 3) DTO -> Entity 변환 (dev 내용 + ksy 암호화 적용)
        UserEntity user = new UserEntity();
        user.setName(dto.getName());
        user.setUserid(dto.getUserid());
        user.setPassword(encodedPw);
        user.setEmail(dto.getEmail());
        user.setPhonenumber(dto.getPhonenumber());
        user.setAgreeservice(dto.isAgreeservice());
        user.setAgreeprivacy(dto.isAgreeprivacy());

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "회원가입이 완료되었습니다!"));
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        String userid = req.getUserid();
        String rawPassword = req.getPassword();

        return userRepository.findByUserid(userid)
                .map(user -> {
                    if (passwordEncoder.matches(rawPassword, user.getPassword())) {
                        Map<String, Object> res = new HashMap<>();
                        res.put("message", "로그인 성공");
                        res.put("userid", user.getUserid());
                        res.put("name", user.getName());
                        return ResponseEntity.ok(res);
                    }
                    return ResponseEntity.status(401).body(Map.of("message", "비밀번호가 틀렸습니다."));
                })
                .orElse(ResponseEntity.status(404).body(Map.of("message", "가입되지 않은 아이디입니다.")));
    }

    // 아이디 찾기
    @GetMapping("/find-id")
    public ResponseEntity<?> findId(@RequestParam String name, @RequestParam String email) {
        return userRepository.findByNameAndEmail(name, email)
                .map(user -> ResponseEntity.ok(Map.of("userid", user.getUserid())))
                .orElse(ResponseEntity.status(404).body(Map.of("message", "일치하는 정보를 찾을 수 없습니다.")));
    }

    // 비밀번호 재설정
    @PostMapping("/reset-pw")
    public ResponseEntity<?> resetPw(@RequestBody Map<String, String> resetData) {
        String userid = resetData.get("userid");
        String email = resetData.get("email");
        String newPassword = resetData.get("newPassword");

        return userRepository.findByUseridAndEmail(userid, email)
                .map(user -> {
                    user.setPassword(passwordEncoder.encode(newPassword));
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("message", "비밀번호가 성공적으로 재설정되었습니다."));
                })
                .orElse(ResponseEntity.status(404).body(Map.of("message", "일치하는 회원 정보가 없습니다.")));
    }
}

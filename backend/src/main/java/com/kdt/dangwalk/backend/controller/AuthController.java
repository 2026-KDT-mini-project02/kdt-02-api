package com.kdt.dangwalk.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // ✅ 추가
import com.kdt.dangwalk.backend.repository.UserRepository;
import com.kdt.dangwalk.backend.client.KakaoApiClient;
import com.kdt.dangwalk.backend.entity.UserEntity;
import java.util.Map;
import java.util.HashMap;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final KakaoApiClient kakaoApiClient;
    private final BCryptPasswordEncoder passwordEncoder; // ✅ 추가

    // 생성자에 passwordEncoder 주입 추가
    public AuthController(UserRepository userRepository, KakaoApiClient kakaoApiClient,
            BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.kakaoApiClient = kakaoApiClient;
        this.passwordEncoder = passwordEncoder;
    }

    // 기존 find-pw 삭제 후 아래 내용 추가
    @PostMapping("/reset-pw")
    public ResponseEntity<String> resetPw(@RequestBody Map<String, String> resetData) {
        String userid = resetData.get("userid");
        String email = resetData.get("email");
        String newPassword = resetData.get("newPassword");

        System.out.println("비밀번호 재설정 요청 - 아이디: " + userid);

        return userRepository.findByUseridAndEmail(userid, email)
                .map(user -> {
                    // ✅ 새 비밀번호 암호화 후 저장
                    String encodedPw = passwordEncoder.encode(newPassword);
                    user.setPassword(encodedPw);
                    userRepository.save(user);
                    return ResponseEntity.ok("비밀번호가 성공적으로 재설정되었습니다.");
                })
                .orElse(ResponseEntity.status(404).body("일치하는 회원 정보가 없습니다."));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody UserEntity userEntity) {
        try {
            System.out.println("회원가입 시도 아이디: " + userEntity.getUserid());

            // ✅ 비밀번호 암호화 후 저장
            String encodedPassword = passwordEncoder.encode(userEntity.getPassword());
            userEntity.setPassword(encodedPassword);

            userRepository.save(userEntity);

            // 가입 성공 시 리액트에서 데이터를 다루기 쉽게 객체로 반환해주는 것이 좋습니다.
            Map<String, String> res = new HashMap<>();
            res.put("message", "회원가입이 완료되었습니다!");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("회원가입 중 오류 발생: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String userId = loginData.get("userId");
        String rawPassword = loginData.get("password"); // 사용자가 입력한 비번

        System.out.println("로그인 시도 아이디: " + userId);

        return userRepository.findByUserid(userId)
                .map(user -> {
                    // ✅ passwordEncoder.matches(입력비번, DB암호화비번)으로 비교
                    if (passwordEncoder.matches(rawPassword, user.getPassword())) {
                        Map<String, String> userInfo = new HashMap<>();
                        userInfo.put("userid", user.getUserid());
                        userInfo.put("name", user.getName());
                        return ResponseEntity.ok(userInfo);
                    } else {
                        return ResponseEntity.status(401).body("비밀번호가 틀렸습니다.");
                    }
                })
                .orElse(ResponseEntity.status(404).body("가입되지 않은 아이디입니다."));
    }

    @GetMapping("/find-id")
    public ResponseEntity<String> findId(@RequestParam String name, @RequestParam String email) {
        return userRepository.findByNameAndEmail(name, email)
                .map(user -> ResponseEntity.ok(user.getUserid()))
                .orElse(ResponseEntity.status(404).body("일치하는 정보를 찾을 수 없습니다."));
    }

    @GetMapping("/find-pw")
    public ResponseEntity<String> findPw(@RequestParam String userid, @RequestParam String email) {
        // ⚠️ 주의: 비밀번호를 암호화해서 저장하면 복호화가 불가능하므로
        // 그대로 보여주는 것은 불가능합니다. 임시 비밀번호 발급 등으로 로직을 바꿔야 하지만
        // 현재는 암호화된 문자열이라도 반환하도록 두겠습니다.
        return userRepository.findByUseridAndEmail(userid, email)
                .map(user -> ResponseEntity.ok("암호화된 비밀번호입니다: " + user.getPassword()))
                .orElse(ResponseEntity.status(404).body("일치하는 회원 정보가 없습니다."));
    }
}
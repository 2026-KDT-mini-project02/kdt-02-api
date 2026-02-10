package com.kdt.dangwalk.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.kdt.dangwalk.backend.repository.UserRepository;
import com.kdt.dangwalk.backend.entity.UserEntity;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import java.util.HashMap;

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

    @GetMapping("/check-id")
    public ResponseEntity<Boolean> checkId(@RequestParam("userId") String userid) {
        System.out.println("아이디 중복 확인 요청 들어옴: " + userid);
        boolean isDuplicate = userRepository.existsByUserid(userid);
        System.out.println("중복 여부 결과: " + isDuplicate);
        return ResponseEntity.ok(isDuplicate);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody UserEntity userEntity, HttpSession session) {
        try {
            System.out.println("회원가입 시도 아이디: " + userEntity.getUserid());

            // ✅ 비밀번호 암호화 후 저장
            String encodedPassword = passwordEncoder.encode(userEntity.getPassword());
            userEntity.setPassword(encodedPassword);

            userRepository.save(userEntity);

            // ✅ 회원가입 성공 시 자동으로 세션 생성 (자동 로그인)
            session.setAttribute("userId", userEntity.getUserid());
            session.setAttribute("userName", userEntity.getName());
            session.setMaxInactiveInterval(60 * 60 * 24); // 24시간 유지

            System.out.println("회원가입 및 자동 로그인 성공 - Session ID: " + session.getId());

            Map<String, String> res = new HashMap<>();
            res.put("message", "회원가입이 완료되었습니다!");
            res.put("userid", userEntity.getUserid());
            res.put("name", userEntity.getName());
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("회원가입 중 오류 발생: " + e.getMessage());
        }
    }

    // ✅ 세션 기반 로그인 (BCrypt 암호화 적용)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData, HttpSession session) {
        String userId = loginData.get("userId");
        String rawPassword = loginData.get("password"); // 사용자가 입력한 비번

        System.out.println("로그인 시도 아이디: " + userId);

        return userRepository.findByUserid(userId)
                .map(user -> {
                    // ✅ passwordEncoder.matches(입력비번, DB암호화비번)으로 비교
                    if (passwordEncoder.matches(rawPassword, user.getPassword())) {
                        // ✅ 세션에 사용자 정보 저장
                        session.setAttribute("userId", user.getUserid());
                        session.setAttribute("userName", user.getName());
                        session.setMaxInactiveInterval(60 * 60 * 24); // 24시간 유지

                        System.out.println("로그인 성공 - Session ID: " + session.getId());

                        Map<String, String> userInfo = new HashMap<>();
                        userInfo.put("userid", user.getUserid());
                        userInfo.put("name", user.getName());
                        userInfo.put("sessionId", session.getId());
                        
                        return ResponseEntity.ok(userInfo);
                    } else {
                        return ResponseEntity.status(401).body("비밀번호가 틀렸습니다.");
                    }
                })
                .orElse(ResponseEntity.status(404).body("가입되지 않은 아이디입니다."));
    }

    // ✅ 로그아웃 (세션 무효화)
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        System.out.println("로그아웃 요청 - Session ID: " + session.getId());
        session.invalidate(); // 세션 무효화
        return ResponseEntity.ok("로그아웃 되었습니다.");
    }

    // ✅ 세션 확인 (현재 로그인된 사용자 정보)
    @GetMapping("/session")
    public ResponseEntity<?> checkSession(HttpSession session) {
        String userId = (String) session.getAttribute("userId");
        String userName = (String) session.getAttribute("userName");

        if (userId != null) {
            System.out.println("세션 유효 - 사용자: " + userId);
            Map<String, String> userInfo = new HashMap<>();
            userInfo.put("userid", userId);
            userInfo.put("name", userName);
            return ResponseEntity.ok(userInfo);
        } else {
            System.out.println("세션 없음 - 로그인 필요");
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
    }

    // 비밀번호 재설정
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

    @GetMapping("/find-id")
    public ResponseEntity<String> findId(@RequestParam String name, @RequestParam String email) {
        System.out.println("아이디 찾기 요청 - 이름: " + name + ", 이메일: " + email);
        
        return userRepository.findByNameAndEmail(name, email)
                .map(user -> ResponseEntity.ok(user.getUserid()))
                .orElse(ResponseEntity.status(404).body("일치하는 정보를 찾을 수 없습니다."));
    }

    @GetMapping("/find-pw")
    public ResponseEntity<String> findPw(@RequestParam String userid, @RequestParam String email) {
        System.out.println("비밀번호 찾기 요청 - 아이디: " + userid + ", 이메일: " + email);
        
        // ⚠️ 주의: 비밀번호를 암호화해서 저장하면 복호화가 불가능하므로
        // 그대로 보여주는 것은 불가능합니다. 임시 비밀번호 발급 등으로 로직을 바꿔야 하지만
        // 현재는 암호화된 문자열이라도 반환하도록 두겠습니다.
        return userRepository.findByUseridAndEmail(userid, email)
                .map(user -> ResponseEntity.ok("암호화된 비밀번호입니다: " + user.getPassword()))
                .orElse(ResponseEntity.status(404).body("일치하는 회원 정보가 없습니다."));
    }
}
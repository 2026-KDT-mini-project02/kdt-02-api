package com.kdt.dangwalk.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
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

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthController(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    // 아이디 중복확인 (프론트가 data===false면 사용가능 처리)
    @GetMapping("/check-id")
    public ResponseEntity<Boolean> checkId(@RequestParam("userId") String userId) {
        boolean exists = userRepository.existsByUserid(userId);
        return ResponseEntity.ok(exists); // true=중복, false=사용가능
    }

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody UserDTO dto, HttpServletRequest request) {

        // 1) 아이디 중복 체크
        if (userRepository.existsByUserid(dto.getUserid())) {
            return ResponseEntity.status(409).body(Map.of("message", "이미 사용 중인 아이디입니다."));
        }

        // 2) 비밀번호 암호화
        String encodedPw = passwordEncoder.encode(dto.getPassword());

        // 3) DTO -> Entity 변환
        UserEntity user = new UserEntity();
        user.setName(dto.getName());
        user.setUserid(dto.getUserid());
        user.setPassword(encodedPw);
        user.setEmail(dto.getEmail());
        user.setPhonenumber(dto.getPhonenumber());
        user.setAgreeservice(dto.isAgreeservice());
        user.setAgreeprivacy(dto.isAgreeprivacy());
        user.setRole("USER");

        userRepository.save(user);

        // 회원가입 직후 세션 로그인 처리
        try {
            authenticateAndCreateSession(dto.getUserid(), dto.getPassword(), request);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "회원가입은 완료되었지만 로그인 세션 생성에 실패했습니다."));
        }

        return ResponseEntity.ok(Map.of(
                "message", "회원가입이 완료되었습니다!",
                "userid", user.getUserid(),
                "name", user.getName()));
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest request) {
        String userid = req.getUserid();

        try {
            authenticateAndCreateSession(userid, req.getPassword(), request);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("message", "아이디 또는 비밀번호가 올바르지 않습니다."));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body(Map.of("message", "인증에 실패했습니다."));
        }

        return userRepository.findByUserid(userid)
                .map(user -> {
                    Map<String, Object> res = new HashMap<>();
                    res.put("message", "로그인 성공");
                    res.put("userid", user.getUserid());
                    res.put("name", user.getName());
                    return ResponseEntity.ok(res);
                })
                .orElse(ResponseEntity.status(401).body(Map.of("message", "인증에 실패했습니다.")));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) {
        new SecurityContextLogoutHandler().logout(request, response, authentication);
        return ResponseEntity.ok(Map.of("message", "로그아웃 되었습니다."));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null
                || authentication instanceof AnonymousAuthenticationToken
                || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "인증되지 않았습니다."));
        }

        String userid = authentication.getName();
        return userRepository.findByUserid(userid)
                .map(user -> ResponseEntity.ok(Map.of(
                        "userid", user.getUserid(),
                        "name", user.getName())))
                .orElse(ResponseEntity.status(404).body(Map.of("message", "사용자를 찾을 수 없습니다.")));
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

    private void authenticateAndCreateSession(String userid, String rawPassword, HttpServletRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userid, rawPassword));

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        HttpSession session = request.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
    }
}

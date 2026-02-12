package com.kdt.dangwalk.backend.config;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  // application.properties에서 읽어오기
  // 예: "http://localhost:3000,http://192.168.1.52:3000"
  @Value("${app.cors.allowed-origins}")
  private String allowedOrigins;

  @Bean
  public BCryptPasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
    return configuration.getAuthenticationManager();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();

    // 콤마로 분리해서 List로 변환
    List<String> origins = Arrays.stream(allowedOrigins.split(","))
        .map(String::trim)
        .filter(s -> !s.isEmpty())
        .collect(Collectors.toList());

    config.setAllowedOrigins(origins);
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .formLogin(AbstractHttpConfigurer::disable)
        .httpBasic(AbstractHttpConfigurer::disable)
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
        .exceptionHandling(ex -> ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
        .authorizeHttpRequests(auth -> auth
            // 1) 완전 공개
            .requestMatchers("/", "/health", "/auth/**", "/api/auth/**").permitAll()

            // 2) 커뮤니티 조회(GET) 공개
            .requestMatchers(HttpMethod.GET, "/community/**", "/api/community/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/weather/**", "/api/weather/**").permitAll()

            // 3) 개인 데이터 조회(GET)는 인증 필요
            .requestMatchers(HttpMethod.GET,
                "/mypage/**", "/dogs/**", "/walk/**", "/record/**", "/users/**",
                "/api/mypage/**", "/api/dogs/**", "/api/walk/**", "/api/record/**", "/api/users/**",
                "/api/dog/**"
            ).authenticated()

            // 4) 쓰기 작업(POST/PUT/DELETE)은 기본 인증 필요
            .requestMatchers(HttpMethod.POST, "/**").authenticated()
            .requestMatchers(HttpMethod.PUT, "/**").authenticated()
            .requestMatchers(HttpMethod.DELETE, "/**").authenticated()

            // 5) 그 외 기본 인증 필요
            .anyRequest().authenticated());

    return http.build();
  }
}

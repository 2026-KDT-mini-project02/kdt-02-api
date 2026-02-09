package com.kdt.dangwalk.backend.dto;

public class LoginRequest {
    private String userid;
    private String password;

    // 기본 생성자 (Jackson 라이브러리가 JSON을 객체로 바꿀 때 필요함)
    public LoginRequest() {}

    // Getter, Setter (이게 있어야 컨트롤러에서 값을 꺼낼 수 있음)
    public String getUserid() { return userid; }
    public void setUserid(String userid) { this.userid = userid; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

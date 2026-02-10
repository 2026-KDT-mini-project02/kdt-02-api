package com.kdt.dangwalk.backend.dto;

public class UserDTO {
    // dto 필드
    private String name;
    private String userid;
    private String password;
    private String email;
    private String phonenumber;
    private boolean agreeservice;
    private boolean agreeprivacy;
    
    // 생성자
    public UserDTO() {}

    // 개터 새터
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getUserid() {
        return userid;
    }
    public void setUserid(String userid) {
        this.userid = userid;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPhonenumber() {
        return phonenumber;
    }
    public void setPhonenumber(String phonenumber) {
        this.phonenumber = phonenumber;
    }
    public boolean isAgreeservice() {
        return agreeservice;
    }
    public void setAgreeservice(boolean agreeservice) {
        this.agreeservice = agreeservice;
    }
    public boolean isAgreeprivacy() {
        return agreeprivacy;
    }
    public void setAgreeprivacy(boolean agreeprivacy) {
        this.agreeprivacy = agreeprivacy;
    }

}

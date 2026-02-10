package com.kdt.dangwalk.backend.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_tbl")
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String name; // 이름

    @Column(nullable = false, unique = true, length = 50)
    private String userid; // 아이디

    @Column(nullable = false, length = 255)
    private String password; // 비밀번호

    @Column(nullable = false, length = 100)
    private String email; // 이메일

    @Column(nullable = false, length = 15)
    private String phonenumber; // 전화번호

    @Column(length = 20)
    private String role = "USER"; // 기본값 USER

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; // 생성일시

    @Column(nullable = false)
    private boolean agreeservice; // DB의 agree_service와 매핑

    @Column(nullable = false)
    private boolean agreeprivacy; // DB의 agree_privacy와 매핑

    public UserEntity() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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
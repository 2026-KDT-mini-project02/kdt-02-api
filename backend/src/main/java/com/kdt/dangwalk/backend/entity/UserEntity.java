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
    // 엔티티 필드
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false, length = 20)
    private String name;

    @Column(name = "userid", nullable = false, unique = true, length = 50)
    private String userid;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "phonenumber", nullable = false, length = 15)
    private String phonenumber;

    @Column(name = "role", length = 20, nullable = false)
    private String role = "USER";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "agreeservice", nullable = false)
    private boolean agreeservice;

    @Column(name = "agreeprivacy", nullable = false)
    private boolean agreeprivacy;

    // 엔티티 생성자
    public UserEntity() {
    }

    public UserEntity(String name, String userid, String password, String email, String phonenumber,
                  boolean agreeservice, boolean agreeprivacy) {
        this.name = name;
        this.userid = userid;
        this.password = password;
        this.email = email;
        this.phonenumber = phonenumber;
        this.agreeservice = agreeservice;
        this.agreeprivacy = agreeprivacy;
    }

    // 엔티티 게터세터
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
package com.yar.back.dto;

public class UserCreateRequest {
    private String username;
    private String email;
    private String password;


    // 기본 생성자, getter/setter 있어야 Jackson이 JSON을 객체로 변환 가능
    public UserCreateRequest() {}

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

package com.yar.back.controller;

import com.yar.back.dto.UserCreateRequest;
import com.yar.back.entity.User;
import com.yar.back.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    // 생성자 주입 (스프링이 자동으로 UserService 빈 주입)
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // POST /users 요청 시 JSON 바디로 username, email 받아서 사용자 생성
    @PostMapping
    public ResponseEntity<String> createUser(@RequestBody UserCreateRequest request) {
        userService.createUser(request.getUsername(), request.getEmail(), request.getPassword());
        return ResponseEntity.ok("User created");
    }
}
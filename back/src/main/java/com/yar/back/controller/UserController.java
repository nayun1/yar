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
//이 컨트롤러의 모든 메서드는 /users로 시작하는 URL에 대응합니다.
public class UserController {

    private final UserService userService;

    // 생성자 주입 (스프링이 자동으로 UserService 빈 주입)
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // POST /users 요청 시 JSON 바디로 username, email 받아서 사용자 자바객체로 맵핑
    @PostMapping
    public ResponseEntity<String> createUser(@RequestBody UserCreateRequest request) {
        userService.createUser(request.getUsername(), request.getEmail(), request.getPassword());
        return ResponseEntity.ok("User created");

        //json 형식으로 들어온 데이터를 자바로 저장

        //클라이언트가 POST /users로 JSON 데이터를 보냄
        //
        //Spring이 JSON을 UserCreateRequest로 변환
        //
        //createUser() 메서드가 서비스에 사용자 생성 요청
        //
        //성공하면 200 OK와 함께 "User created" 응답
    }
}
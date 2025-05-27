package com.yar.back.service;

import com.yar.back.entity.User;
import com.yar.back.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
//userService 클래스는 Spring boot에 사용자를DB에 저장하는 서비스 로직
//@Service: 이 클래스가 서비스 컴포넌트임을 스프링에게 알려줍니다.
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void createUser(String username, String email, String password) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        userRepository.save(user);
    }
}
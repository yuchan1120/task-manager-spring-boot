package com.example.taskmanager;

import com.example.taskmanager.model.User;
import com.example.taskmanager.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
                String encodedPassword = encoder.encode("testpass");
                userRepository.save(new User("testuser", encodedPassword));
            }
        };
    }
}

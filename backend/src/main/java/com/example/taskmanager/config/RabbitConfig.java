package com.example.taskmanager.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    @Bean
    public Queue todoQueue() {
        return new Queue("todoQueue", false);
    }
}

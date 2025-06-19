package com.example.taskmanager.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class TodoReceiver {

    @RabbitListener(queues = "todoQueue")
    public void receive(String message) {
        System.out.println("Received from RabbitMQ: " + message);
        // 必要に応じてDB保存などの処理を追加
    }
}

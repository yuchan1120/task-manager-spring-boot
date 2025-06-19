package com.example.taskmanager.controller;

import com.example.taskmanager.service.TodoSender;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class RabbitTestController {

    @Autowired
    private TodoSender sender;

    @PostMapping
    public ResponseEntity<String> sendMessage(@RequestBody String message) {
        sender.send(message);
        return ResponseEntity.ok("Message sent to RabbitMQ: " + message);
    }
}

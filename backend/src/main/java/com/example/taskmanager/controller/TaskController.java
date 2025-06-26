package com.example.taskmanager.controller;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.taskmanager.dto.TaskDTO;
import com.example.taskmanager.mapper.TaskMapper;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.repository.TagRepository;
import com.example.taskmanager.service.TaskService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import com.example.taskmanager.model.Tag;

@CrossOrigin(origins = "http://localhost:3000")

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final TagRepository tagRepository;

    @Autowired
    public TaskController(TaskService taskService, TagRepository tagRepository) {
        this.taskService = taskService;
        this.tagRepository = tagRepository;
    }

    @GetMapping
    public List<TaskDTO> getTasks() {
        return taskService.getAllTasks().stream()
                .map(TaskMapper::toDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody TaskDTO dto) {
        Task task = new Task();
        task.setTitle(dto.title);
        task.setDescription(dto.description);
        task.setCompleted(dto.completed);
        if (dto.dueDate != null) {
            task.setDueDate(LocalDate.parse(dto.dueDate));
        }

        if (dto.tagIds != null && !dto.tagIds.isEmpty()) {
            Set<Tag> tags = new HashSet<>(tagRepository.findAllById(dto.tagIds));
            task.setTags(tags);
        }

        Task createdTask = taskService.createTask(task);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<Task> toggleTask(@PathVariable Long id) {
        Optional<Task> optionalTask = taskService.getTaskById(id); // taskRepository → taskService に変更
        if (optionalTask.isPresent()) {
            Task task = optionalTask.get();
            task.setCompleted(!task.isCompleted());
            taskService.saveTask(task); // taskRepository.save → service経由に
            return ResponseEntity.ok(task);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        Optional<Task> optionalTask = taskService.getTaskById(id);
        if (optionalTask.isPresent()) {
            taskService.deleteTask(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody TaskDTO dto) {
        Optional<Task> optionalTask = taskService.getTaskById(id);
        if (optionalTask.isPresent()) {
            Task task = optionalTask.get();
            task.setTitle(dto.title);
            task.setDescription(dto.description);
            if (dto.dueDate != null) {
                task.setDueDate(LocalDate.parse(dto.dueDate));
            }

            if (dto.tagIds != null) {
                Set<Tag> tags = new HashSet<>(tagRepository.findAllById(dto.tagIds));
                task.setTags(tags);
            }

            taskService.saveTask(task);
            return ResponseEntity.ok(task);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

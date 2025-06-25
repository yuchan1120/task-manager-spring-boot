package com.example.taskmanager.mapper;

import com.example.taskmanager.dto.TaskDTO;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.Tag;

import java.util.stream.Collectors;

public class TaskMapper {

    public static TaskDTO toDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.id = task.getId();
        dto.title = task.getTitle();
        dto.description = task.getDescription();
        dto.completed = task.isCompleted();
        dto.dueDate = task.getDueDate() != null ? task.getDueDate().toString() : null;
        dto.tagIds = task.getTags().stream()
                .map(Tag::getId)
                .collect(Collectors.toSet());
        return dto;
    }
}

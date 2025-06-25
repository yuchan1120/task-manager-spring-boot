package com.example.taskmanager.dto;

import java.util.Set;

public class TaskDTO {
    public Long id;
    public String title;
    public String description;
    public boolean completed;
    public String dueDate;
    public Set<Long> tagIds;
}

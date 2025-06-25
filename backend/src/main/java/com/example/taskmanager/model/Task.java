package com.example.taskmanager.model;

import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;

import com.example.taskmanager.dto.TaskDTO;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private boolean completed;

    @Column(name = "due_date")
    private LocalDate dueDate;

    // Getter & Setter（右クリック → Generate → Getter and Setter でもOK）
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    @ManyToMany
    @JoinTable(
        name = "task_tags",
        joinColumns = @JoinColumn(name = "task_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags;

    public Set<Tag> getTags() {
        return tags;
    }

    public void setTags(Set<Tag> tags) {
        this.tags = tags;
    }

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

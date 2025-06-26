package com.example.taskmanager.repository;

import com.example.taskmanager.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    // 必要に応じてカスタムクエリを追加できます
}

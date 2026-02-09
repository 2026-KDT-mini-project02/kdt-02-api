package com.kdt.dangwalk.backend.repository;

import com.kdt.dangwalk.backend.entity.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    @Query("SELECT p FROM CommunityPost p WHERE " +
            "(:category IS NULL OR :category = '전체' OR p.category = :category) AND " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(CAST(p.content AS string)) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY p.createdAt DESC")
    List<CommunityPost> searchPosts(@Param("category") String category, @Param("keyword") String keyword);
}

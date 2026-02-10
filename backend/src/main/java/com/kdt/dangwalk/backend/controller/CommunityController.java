package com.kdt.dangwalk.backend.controller;

import com.kdt.dangwalk.backend.dto.*;
import com.kdt.dangwalk.backend.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @PostMapping
    public ResponseEntity<CommunityPostDetailResponse> createPost(@RequestBody CommunityPostCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(communityService.createPost(request));
    }

    @GetMapping
    public ResponseEntity<List<CommunityPostListResponse>> getPosts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(communityService.getPosts(category, keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommunityPostDetailResponse> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(communityService.getPostDetail(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommunityPostDetailResponse> updatePost(
            @PathVariable Long id,
            @RequestBody CommunityPostUpdateRequest request) {
        return ResponseEntity.ok(communityService.updatePost(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        communityService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<CommunityPostDetailResponse> likePost(@PathVariable Long id) {
        return ResponseEntity.ok(communityService.likePost(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommunityCommentResponse> addComment(
            @PathVariable Long id,
            @RequestBody CommunityCommentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(communityService.addComment(id, request));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        communityService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}

package com.kdt.dangwalk.backend.controller;

import com.kdt.dangwalk.backend.dto.*;
import com.kdt.dangwalk.backend.service.CommunityService;
import com.kdt.dangwalk.backend.service.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CommunityController {

    private final CommunityService communityService;
    private final SseService sseService;

    // SSE 구독 엔드포인트
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        return sseService.subscribe();
    }

    @PostMapping
    public ResponseEntity<CommunityPostDetailResponse> createPost(@RequestBody CommunityPostCreateRequest request) {
        CommunityPostDetailResponse response = communityService.createPost(request);
        sseService.broadcast("community-update", "post-created");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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
            @RequestHeader("X-User-Id") String userId,
            @RequestBody CommunityPostUpdateRequest request) {
        CommunityPostDetailResponse response = communityService.updatePost(id, userId, request);
        sseService.broadcast("community-update", "post-updated");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String userId) {
        communityService.deletePost(id, userId);
        sseService.broadcast("community-update", "post-deleted");
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<CommunityPostDetailResponse> likePost(@PathVariable Long id) {
        CommunityPostDetailResponse response = communityService.likePost(id);
        sseService.broadcast("community-update", "post-liked");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<CommunityPostDetailResponse> unlikePost(@PathVariable Long id) {
        CommunityPostDetailResponse response = communityService.unlikePost(id);
        sseService.broadcast("community-update", "post-unliked");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommunityCommentResponse> addComment(
            @PathVariable Long id,
            @RequestBody CommunityCommentCreateRequest request) {
        CommunityCommentResponse response = communityService.addComment(id, request);
        sseService.broadcast("community-update", "comment-added");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestHeader("X-User-Id") String userId) {
        communityService.deleteComment(commentId, userId);
        sseService.broadcast("community-update", "comment-deleted");
        return ResponseEntity.noContent().build();
    }
}

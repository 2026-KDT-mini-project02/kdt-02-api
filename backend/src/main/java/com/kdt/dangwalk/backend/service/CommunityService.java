package com.kdt.dangwalk.backend.service;

import com.kdt.dangwalk.backend.dto.*;
import com.kdt.dangwalk.backend.entity.CommunityComment;
import com.kdt.dangwalk.backend.entity.CommunityPost;
import com.kdt.dangwalk.backend.repository.CommunityCommentRepository;
import com.kdt.dangwalk.backend.repository.CommunityPostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityPostRepository postRepository;
    private final CommunityCommentRepository commentRepository;

    @Transactional
    public CommunityPostDetailResponse createPost(CommunityPostCreateRequest request) {
        CommunityPost post = new CommunityPost();
        post.setCategory(request.category());
        post.setTitle(request.title());
        post.setContent(request.content());
        post.setAuthor(request.author());
        post.setPlace(request.place());
        post.setTags(normalizeTags(request.tags()));

        CommunityPost saved = postRepository.save(post);
        log.info("커뮤니티 게시글 생성: {}", saved.getId());
        return toDetailResponse(saved, Collections.emptyList());
    }

    @Transactional(readOnly = true)
    public List<CommunityPostListResponse> getPosts(String category, String keyword) {
        String normalizedCategory = (category == null || category.isBlank()) ? "전체" : category.trim();
        String normalizedKeyword = (keyword == null || keyword.isBlank()) ? "" : keyword.trim();
        
        List<CommunityPost> posts = postRepository.searchPosts(normalizedCategory, normalizedKeyword);
        return posts.stream()
                .map(this::toListResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommunityPostDetailResponse getPostDetail(Long id) {
        CommunityPost post = getPostEntity(id);
        post.setViewCount(post.getViewCount() + 1);
        List<CommunityComment> comments = commentRepository.findByPostIdOrderByCreatedAtDesc(id);
        return toDetailResponse(post, comments);
    }

    @Transactional
    public void deletePost(Long id) {
        postRepository.deleteById(id);
        log.info("커뮤니티 게시글 삭제: {}", id);
    }

    @Transactional
    public CommunityPostDetailResponse updatePost(Long id, CommunityPostUpdateRequest request) {
        CommunityPost post = getPostEntity(id);
        if (request.category() != null) {
            post.setCategory(request.category());
        }
        if (request.title() != null) {
            post.setTitle(request.title());
        }
        if (request.content() != null) {
            post.setContent(request.content());
        }
        if (request.place() != null) {
            post.setPlace(request.place());
        }
        if (request.tags() != null) {
            post.setTags(normalizeTags(request.tags()));
        }
        CommunityPost saved = postRepository.save(post);
        List<CommunityComment> comments = commentRepository.findByPostIdOrderByCreatedAtDesc(id);
        return toDetailResponse(saved, comments);
    }

    @Transactional
    public CommunityPostDetailResponse likePost(Long id) {
        CommunityPost post = getPostEntity(id);
        post.setLikes(post.getLikes() + 1);
        CommunityPost saved = postRepository.save(post);
        List<CommunityComment> comments = commentRepository.findByPostIdOrderByCreatedAtDesc(id);
        return toDetailResponse(saved, comments);
    }

    @Transactional
    public CommunityCommentResponse addComment(Long postId, CommunityCommentCreateRequest request) {
        CommunityPost post = getPostEntity(postId);

        CommunityComment comment = new CommunityComment();
        comment.setPost(post);
        comment.setName(request.name());
        comment.setText(request.text());

        CommunityComment saved = commentRepository.save(comment);
        log.info("댓글 생성: 게시글={}, 댓글={}", postId, saved.getId());

        return new CommunityCommentResponse(
                saved.getId(),
                saved.getName(),
                getTimeAgo(saved.getCreatedAt()),
                saved.getText()
        );
    }

    @Transactional
    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
        log.info("댓글 삭제: {}", commentId);
    }

    private CommunityPost getPostEntity(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + id));
    }

    private CommunityPostListResponse toListResponse(CommunityPost post) {
        String preview = post.getContent();
        if (preview != null && preview.length() > 100) {
            preview = preview.substring(0, 100) + "...";
        }
        List<String> tags = post.getTags() == null
                ? Collections.emptyList()
                : List.copyOf(post.getTags());
        return new CommunityPostListResponse(
                post.getId(),
                post.getCategory(),
                post.getTitle(),
                preview,
                tags,
                post.getPlace(),
                getTimeAgo(post.getCreatedAt()),
                post.getLikes(),
                post.getComments() == null ? 0 : post.getComments().size()
        );
    }

    private CommunityPostDetailResponse toDetailResponse(CommunityPost post, List<CommunityComment> comments) {
        List<CommunityCommentResponse> commentResponses = comments.stream()
                .map(comment -> new CommunityCommentResponse(
                        comment.getId(),
                        comment.getName(),
                        getTimeAgo(comment.getCreatedAt()),
                        comment.getText()
                ))
                .collect(Collectors.toList());

        List<String> tags = post.getTags() == null
            ? Collections.emptyList()
            : List.copyOf(post.getTags());

        return new CommunityPostDetailResponse(
                post.getId(),
                post.getCategory(),
                post.getTitle(),
                post.getContent(),
                post.getAuthor(),
            tags,
                post.getPlace(),
                getTimeAgo(post.getCreatedAt()),
                post.getLikes(),
                commentResponses
        );
    }

    private List<String> normalizeTags(List<String> tags) {
        if (tags == null) {
            return Collections.emptyList();
        }
        return tags.stream()
                .filter(tag -> tag != null && !tag.isBlank())
                .map(String::trim)
                .distinct()
                .collect(Collectors.toList());
    }

    private String getTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        
        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        long seconds = duration.getSeconds();
        
        if (seconds < 60) return "방금";
        if (seconds < 3600) return (seconds / 60) + "분 전";
        if (seconds < 86400) return (seconds / 3600) + "시간 전";
        if (seconds < 2592000) return (seconds / 86400) + "일 전";
        return (seconds / 2592000) + "개월 전";
    }
}

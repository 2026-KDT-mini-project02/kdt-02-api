package com.kdt.dangwalk.backend.dto;

public record CommunityCommentCreateRequest(
        String userId,
        String text
) {
}

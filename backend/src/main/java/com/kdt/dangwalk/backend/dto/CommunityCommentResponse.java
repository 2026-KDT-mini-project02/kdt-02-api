package com.kdt.dangwalk.backend.dto;

public record CommunityCommentResponse(
        Long id,
        String name,
        String userId,
        String time,
        String text
) {
}

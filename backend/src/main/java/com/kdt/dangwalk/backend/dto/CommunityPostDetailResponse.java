package com.kdt.dangwalk.backend.dto;

import java.util.List;

public record CommunityPostDetailResponse(
        Long id,
        String type,
        String title,
        String content,
        String author,
        String userId,
        List<String> tags,
        String place,
        String timeAgo,
        long likes,
        List<CommunityCommentResponse> comments
) {
}

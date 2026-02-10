package com.kdt.dangwalk.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record CommunityPostDetailResponse(
        Long id,
        String type,
        String title,
        String content,
        String author,
        List<String> tags,
        String place,
        String timeAgo,
        long likes,
        List<CommunityCommentResponse> comments
) {
}

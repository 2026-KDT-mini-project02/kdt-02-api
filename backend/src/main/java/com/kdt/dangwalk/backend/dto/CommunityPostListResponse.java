package com.kdt.dangwalk.backend.dto;

import java.util.List;

public record CommunityPostListResponse(
        Long id,
        String type,
        String title,
        String content,
        List<String> tags,
        String place,
        String timeAgo,
        long likes,
        long comments
) {
}

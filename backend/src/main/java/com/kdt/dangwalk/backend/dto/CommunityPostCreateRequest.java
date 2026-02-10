package com.kdt.dangwalk.backend.dto;

import java.util.List;

public record CommunityPostCreateRequest(
        String category,
        String title,
        String content,
        String author,
        String userId,
        String place,
        List<String> tags
) {
}

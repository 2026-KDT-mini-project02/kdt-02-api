package com.kdt.dangwalk.backend.dto;

import java.util.List;

public record CommunityPostUpdateRequest(
        String category,
        String title,
        String content,
        String place,
        List<String> tags
) {
}

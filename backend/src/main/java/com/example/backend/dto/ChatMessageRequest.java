package com.example.backend.dto;

import jakarta.validation.constraints.NotNull;

public record ChatMessageRequest(
        @NotNull String content
) {
}

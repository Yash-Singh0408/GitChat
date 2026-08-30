package com.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TreeNodeDto {
    private String name;
    private TreeNodeType type;
    private List<TreeNodeDto> children;

    public enum TreeNodeType {
        FILE, DIRECTORY
    }
}

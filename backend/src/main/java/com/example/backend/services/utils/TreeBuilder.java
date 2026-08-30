package com.example.backend.services.utils;

import com.example.backend.dto.TreeNodeDto;
import com.example.backend.dto.TreeNodeDto.TreeNodeType;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class TreeBuilder {

    /**
     * Converts a flat list of GitHub tree items into a hierarchical tree structure.
     * GitHub API returns flat paths like "src/main/java/App.java"
     * This converts them into a nested tree.
     *
     * @param treeItems List of tree items from GitHub API (must have "path" and "type" fields)
     * @param repoName The root repository name
     * @return Root TreeNodeDto with hierarchical structure
     */
    public static TreeNodeDto buildTree(List<Map<String, Object>> treeItems, String repoName) {
        TreeNodeDto root = TreeNodeDto.builder()
                .name(repoName)
                .type(TreeNodeType.DIRECTORY)
                .children(new ArrayList<>())
                .build();

        if (treeItems == null || treeItems.isEmpty()) {
            return root;
        }

        Map<String, TreeNodeDto> nodeCache = new HashMap<>();
        nodeCache.put("", root);

        for (Map<String, Object> item : treeItems) {
            String path = String.valueOf(item.get("path"));
            String type = String.valueOf(item.get("type"));

            // Split path into parts and filter out empty parts
            String[] allParts = path.split("/");
            ArrayList<String> parts = new ArrayList<>();
            for (String part : allParts) {
                if (!part.isBlank()) {
                    parts.add(part);
                }
            }

            if (parts.isEmpty()) {
                continue;
            }

            // Navigate/create the tree structure
            StringBuilder currentPath = new StringBuilder();
            TreeNodeDto currentParent = root;

            for (int i = 0; i < parts.size(); i++) {
                String part = parts.get(i);
                boolean isLastPart = i == parts.size() - 1;

                if (!currentPath.isEmpty()) {
                    currentPath.append("/");
                }
                currentPath.append(part);
                String fullPath = currentPath.toString();

                // Check if node already exists in cache
                TreeNodeDto node = nodeCache.get(fullPath);

                if (node == null) {
                    boolean isFile = isLastPart && "blob".equals(type);

                    node = TreeNodeDto.builder()
                            .name(part)
                            .type(isFile ? TreeNodeType.FILE : TreeNodeType.DIRECTORY)
                            .children(isFile ? null : new ArrayList<>())
                            .build();

                    nodeCache.put(fullPath, node);
                    currentParent.getChildren().add(node);
                }

                // Move to this node for the next iteration (only if it's a directory)
                if (!isLastPart || !"blob".equals(type)) {
                    currentParent = node;
                }
            }
        }

        // Sort children for better UX: directories first, then files, both alphabetically
        sortTree(root);

        return root;
    }

    /**
     * Recursively sorts tree nodes: directories first (alphabetically),
     * then files (alphabetically)
     */
    private static void sortTree(TreeNodeDto node) {
        if (node.getChildren() != null && !node.getChildren().isEmpty()) {
            node.getChildren().sort((a, b) -> {
                // Directories come first
                if (a.getType() != b.getType()) {
                    return a.getType() == TreeNodeType.DIRECTORY ? -1 : 1;
                }
                // Then sort by name
                return a.getName().compareToIgnoreCase(b.getName());
            });

            // Recursively sort children
            for (TreeNodeDto child : node.getChildren()) {
                sortTree(child);
            }
        }
    }
}

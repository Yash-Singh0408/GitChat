package com.example.backend.services;


import com.example.backend.dto.IndexStatusResponse;
import com.example.backend.dto.RepositoryResponse;
import com.example.backend.entity.Repository;
import com.example.backend.entity.User;
import com.example.backend.exceptions.NotFoundException;
import com.example.backend.repository.RepositoryRepository;
import com.example.backend.services.github.GithubApiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RepoService {

    private final RepositoryRepository repositoryRepository;
    private final UserService userService;
    private final GithubApiClient gitHubApiClient;

    @Transactional  //list and syn user repo
    public List<RepositoryResponse> syncAndListRepos(UUID userId){
        User user = userService.requiredById(userId);
        String token = userService.decryptAccessToken(user);
        List<Map<String, Object>> remoteRepos = gitHubApiClient.listUserRepos(token);

        List<Repository> saved = new ArrayList<>();

        for (Map<String, Object> remote : remoteRepos) {
            Long githubRepoId = toLong(remote.get("id"));
            Repository repo = repositoryRepository
                    .findByUserIdAndGithubRepoId(userId, githubRepoId)
                    .orElseGet(Repository::new);

            String fullName = String.valueOf(remote.get("full_name"));
            String[] parts = fullName.split("/", 2);

            repo.setUserId(userId);
            repo.setGithubRepoId(githubRepoId);
            repo.setOwner(parts.length > 0 ? parts[0] : String.valueOf(remote.get("owner")));
            repo.setName(parts.length > 1 ? parts[1] : String.valueOf(remote.get("name")));
            repo.setFullName(fullName);
            repo.setPrivate(Boolean.TRUE.equals(remote.get("private")));
            repo.setDefaultBranch(remote.get("default_branch") != null
                    ? String.valueOf(remote.get("default_branch"))
                    : "main");
            repo.setLanguage(remote.get("language") != null ? String.valueOf(remote.get("language")) : null);
            repo.setHtmlUrl(remote.get("html_url") != null ? String.valueOf(remote.get("html_url")) : null);
            repo.setDescription(remote.get("description") != null ? String.valueOf(remote.get("description")) : null);
            repo.setCreatedAt(parseInstant(remote.get("created_at")));
            repo.setUpdatedAt(parseInstant(remote.get("updated_at")));
            if (repo.getOwner() == null || repo.getOwner().isBlank()) {
                Object ownerObj = remote.get("owner");
                if (ownerObj instanceof Map<?, ?> ownerMap && ownerMap.get("login") != null) {
                    repo.setOwner(String.valueOf(ownerMap.get("login")));
                }
            }
            saved.add(repositoryRepository.save(repo));
        }

        String currentUserLogin = user.getGithubUsername();


        return saved.stream()
                .sorted(compareRepos(currentUserLogin))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true) //sort the repo
    public List<RepositoryResponse> listStored(UUID userId) {
        User user = userService.requiredById(userId);
        String currentUserLogin = user.getGithubUsername();

        return repositoryRepository.findByUserIdOrderByFullNameAsc(userId).stream()
                .sorted(compareRepos(currentUserLogin))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true) //owner of the repo
    public Repository requireOwned(UUID repoId, UUID userId) {
        return repositoryRepository.findByIdAndUserId(repoId, userId)
                .orElseThrow(() -> new NotFoundException("Repository not found"));
    }

    @Transactional(readOnly = true) // current status
    public IndexStatusResponse status(UUID repoId, UUID userId) {
        Repository repo = requireOwned(repoId, userId);
        return new IndexStatusResponse(
                repo.getId(),
                repo.getIndexStatus(),
                repo.getFilesTotal(),
                repo.getFilesProcessed(),
                repo.getChunkCount(),
                repo.getIndexedAt(),
                repo.getErrorMessage());
    }

    public RepositoryResponse toResponse(Repository repo) {
        return new RepositoryResponse(
                repo.getId(),
                repo.getGithubRepoId(),
                repo.getOwner(),
                repo.getName(),
                repo.getFullName(),
                repo.isPrivate(),
                repo.getDefaultBranch(),
                repo.getLanguage(),
                repo.getHtmlUrl(),
                repo.getDescription(),
                repo.getIndexStatus(),
                repo.getIndexedAt(),
                repo.getChunkCount(),
                repo.getFilesTotal(),
                repo.getFilesProcessed(),
                repo.getErrorMessage());
    }

    private Comparator<Repository> compareRepos(String currentUserLogin) {

        return Comparator
                .comparing(
                        (Repository repo) -> repo.getCreatedAt() != null
                                ? repo.getCreatedAt()
                                : Instant.MIN,
                        Comparator.reverseOrder()
                )
                .thenComparingInt(repo ->
                        repo.getOwner() != null
                                && repo.getOwner().equalsIgnoreCase(currentUserLogin)
                                ? 0
                                : 1
                )
                .thenComparing(
                        repo -> repo.getFullName() != null
                                ? repo.getFullName()
                                : "",
                        String.CASE_INSENSITIVE_ORDER
                );
    }

    private static Instant parseInstant(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        try {
            return Instant.parse(String.valueOf(value));
        } catch (Exception ex) {
            return null;
        }
    }

    private static Long toLong(Object value){
        if(value instanceof Number number){
            return number.longValue();
        }
        return Long.parseLong(String.valueOf(value));
    }
}

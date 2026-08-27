package com.example.backend.security;

import com.example.backend.exceptions.UnauthorizedException;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {
    public AppUserPrinciple require() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AppUserPrinciple principal)) {
            throw new UnauthorizedException("Not authenticated");
        }
        return principal;
    }
}

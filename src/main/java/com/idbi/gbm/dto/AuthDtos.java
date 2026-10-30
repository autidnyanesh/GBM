package com.idbi.gbm.dto;

import com.idbi.gbm.entity.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public final class AuthDtos {
    private AuthDtos() {}

    public record LoginRequest(@NotBlank @Size(max = 100) String username, @NotBlank String password) {}
    public record BootstrapRequest(@NotBlank @Size(max = 100) String username,
            @NotBlank @Size(min = 12, max = 128) String password,
            @NotBlank @Size(max = 160) String displayName) {}
    public record CreateUserRequest(@NotBlank @Size(max = 100) String username,
            @NotBlank @Size(min = 12, max = 128) String password,
            @NotBlank @Size(max = 160) String displayName, UserRole role) {}
    public record UpdateUserRequest(@Size(max = 160) String displayName, UserRole role, Boolean enabled,
            @Size(min = 12, max = 128) String newPassword) {}
    public record UserSummary(Long id, String username, String displayName, UserRole role, boolean enabled,
            Instant createdAt) {}
    public record LoginResponse(UserSummary user, Instant expiresAt) {}
    public record LogoutResponse(boolean loggedOut) {}
}


package com.idbi.gbm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "GBM_USERS")
public class GbmUser {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "gbm_users_seq")
    @SequenceGenerator(name = "gbm_users_seq", sequenceName = "GBM_USERS_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "USERNAME", nullable = false, unique = true, length = 100)
    private String username;

    @Column(name = "PASSWORD_HASH", nullable = false, length = 100)
    private String passwordHash;

    @Column(name = "DISPLAY_NAME", nullable = false, length = 160)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE_NAME", nullable = false, length = 20)
    private UserRole role = UserRole.USER;

    @Column(name = "ENABLED", nullable = false)
    private boolean enabled = true;

    @Column(name = "CREATED_AT", nullable = false)
    private Instant createdAt;

    protected GbmUser() {}

    public GbmUser(String username, String passwordHash, String displayName, UserRole role) {
        this.username = username.trim();
        this.passwordHash = passwordHash;
        this.displayName = displayName.trim();
        this.role = role == null ? UserRole.USER : role;
        this.enabled = true;
    }

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public String getDisplayName() { return displayName; }
    public UserRole getRole() { return role; }
    public boolean isEnabled() { return enabled; }
    public Instant getCreatedAt() { return createdAt; }

    public void updateProfile(String displayName, UserRole role, Boolean enabled) {
        if (displayName != null && !displayName.isBlank()) this.displayName = displayName.trim();
        if (role != null) this.role = role;
        if (enabled != null) this.enabled = enabled;
    }

    public void changePassword(String passwordHash) { this.passwordHash = passwordHash; }
}



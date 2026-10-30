package com.idbi.gbm.repository;

import com.idbi.gbm.entity.GbmUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GbmUserRepository extends JpaRepository<GbmUser, Long> {
    Optional<GbmUser> findByUsernameIgnoreCase(String username);
    boolean existsByUsernameIgnoreCase(String username);
    long countByRole(com.idbi.gbm.entity.UserRole role);
    long countByRoleAndEnabledTrue(com.idbi.gbm.entity.UserRole role);
}



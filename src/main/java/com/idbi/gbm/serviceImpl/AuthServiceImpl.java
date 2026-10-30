package com.idbi.gbm.serviceImpl;

import com.idbi.gbm.service.AuthService;

import com.idbi.gbm.dto.AuthDtos;
import com.idbi.gbm.entity.GbmUser;
import com.idbi.gbm.entity.UserRole;
import com.idbi.gbm.repository.GbmUserRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthServiceImpl implements AuthService {
    private final GbmUserRepository users;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(GbmUserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthDtos.UserSummary bootstrap(AuthDtos.BootstrapRequest request) {
        if (users.count() != 0) throw new ResponseStatusException(HttpStatus.CONFLICT, "Initial administrator already exists");
        return toSummary(users.save(new GbmUser(request.username(), passwordEncoder.encode(request.password()),
                request.displayName(), UserRole.ADMIN)));
    }

    @Transactional(readOnly = true)
    public AuthDtos.UserSummary findByUsername(String username) {
        return users.findByUsernameIgnoreCase(username).map(this::toSummary)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @Transactional(readOnly = true)
    public List<AuthDtos.UserSummary> listUsers() {
        return users.findAll().stream().map(this::toSummary).toList();
    }

    @Transactional
    public AuthDtos.UserSummary createUser(AuthDtos.CreateUserRequest request) {
        if (users.existsByUsernameIgnoreCase(request.username()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        GbmUser user = new GbmUser(request.username(), passwordEncoder.encode(request.password()),
                request.displayName(), request.role() == null ? UserRole.USER : request.role());
        return toSummary(users.save(user));
    }

    @Transactional
    public AuthDtos.UserSummary updateUser(long id, AuthDtos.UpdateUserRequest request) {
        GbmUser user = users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        boolean removingEnabledAdmin = user.isEnabled() && user.getRole() == UserRole.ADMIN
                && (Boolean.FALSE.equals(request.enabled()) || request.role() == UserRole.USER);
        if (removingEnabledAdmin && users.countByRoleAndEnabledTrue(UserRole.ADMIN) <= 1)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "At least one administrator must remain enabled");
        user.updateProfile(request.displayName(), request.role(), request.enabled());
        if (request.newPassword() != null && !request.newPassword().isBlank())
            user.changePassword(passwordEncoder.encode(request.newPassword()));
        return toSummary(user);
    }

    @Transactional
    public void deleteUser(long id, String currentUsername) {
        GbmUser user = users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getUsername().equalsIgnoreCase(currentUsername))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You cannot delete your own account");
        if (user.getRole() == UserRole.ADMIN && user.isEnabled()
                && users.countByRoleAndEnabledTrue(UserRole.ADMIN) <= 1)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "At least one administrator must remain");
        users.delete(user);
    }

    public AuthDtos.UserSummary toSummary(GbmUser user) {
        return new AuthDtos.UserSummary(user.getId(), user.getUsername(), user.getDisplayName(),
                user.getRole(), user.isEnabled(), user.getCreatedAt());
    }
}







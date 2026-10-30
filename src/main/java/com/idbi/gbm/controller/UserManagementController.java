package com.idbi.gbm.controller;

import com.idbi.gbm.dto.AuthDtos;
import com.idbi.gbm.service.AuthService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/users")
public class UserManagementController {
    private final AuthService authService;

    public UserManagementController(AuthService authService) { this.authService = authService; }

    @GetMapping
    public List<AuthDtos.UserSummary> list() { return authService.listUsers(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AuthDtos.UserSummary create(@Valid @RequestBody AuthDtos.CreateUserRequest request) {
        return authService.createUser(request);
    }

    @PatchMapping("/{id}")
    public AuthDtos.UserSummary update(@PathVariable long id,
            @Valid @RequestBody AuthDtos.UpdateUserRequest request) {
        return authService.updateUser(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id, Principal principal) {
        authService.deleteUser(id, principal.getName());
    }
}


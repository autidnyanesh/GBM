package com.idbi.gbm.service;

import com.idbi.gbm.dto.AuthDtos;
import java.util.List;

public interface AuthService {
    AuthDtos.UserSummary bootstrap(AuthDtos.BootstrapRequest request);
    AuthDtos.UserSummary findByUsername(String username);
    List<AuthDtos.UserSummary> listUsers();
    AuthDtos.UserSummary createUser(AuthDtos.CreateUserRequest request);
    AuthDtos.UserSummary updateUser(long id, AuthDtos.UpdateUserRequest request);
    void deleteUser(long id, String currentUsername);
}


package in.praladneupane.chat.auth.controller;

import in.praladneupane.chat.auth.dto.request.LoginRequest;
import in.praladneupane.chat.auth.dto.request.RegisterRequest;
import in.praladneupane.chat.auth.dto.response.AuthResponse;
import in.praladneupane.chat.auth.service.AuthService;
import in.praladneupane.chat.common.dto.response.APIResponse;
import in.praladneupane.chat.user.dto.response.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<APIResponse<UserResponse>> registerUser(@RequestBody @Valid RegisterRequest request){
        UserResponse userResponse = authService.registerUser(request);
        APIResponse<UserResponse> apiResponse = APIResponse.<UserResponse>builder()
                .message("User registered successfully")
                .data(userResponse)
                .success(true)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<APIResponse<AuthResponse>> loginUser(@RequestBody @Valid LoginRequest request){
        AuthResponse loginResponse = authService.loginUser(request);
        APIResponse<AuthResponse>  apiResponse = APIResponse.<AuthResponse>builder()
                .message("User logged in successfully")
                .data(loginResponse)
                .success(true)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}

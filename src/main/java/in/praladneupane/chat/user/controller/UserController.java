package in.praladneupane.chat.user.controller;

import in.praladneupane.chat.common.dto.response.APIResponse;
import in.praladneupane.chat.auth.security.UserPrincipal;
import in.praladneupane.chat.user.dto.request.UserSearchRequest;
import in.praladneupane.chat.user.dto.response.UserSearchResponse;
import in.praladneupane.chat.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    @GetMapping("/search")
    public ResponseEntity<APIResponse<Page<UserSearchResponse>>> searchUsers(
            @ModelAttribute UserSearchRequest request,
            Pageable pageable,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Page<UserSearchResponse> users =
                userService.searchUsers(
                        request,
                        pageable,
                        userPrincipal.getId()
                );

        APIResponse<Page<UserSearchResponse>> apiResponse =
                APIResponse.<Page<UserSearchResponse>>builder()
                        .message("Users searched successfully")
                        .data(users)
                        .success(true)
                        .timestamp(LocalDateTime.now())
                        .build();

        return ResponseEntity.ok(apiResponse);
    }

}

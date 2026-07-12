package in.praladneupane.chat.chat.controller;

import in.praladneupane.chat.auth.security.UserPrincipal;
import in.praladneupane.chat.chat.dto.response.ConversationResponse;
import in.praladneupane.chat.chat.service.ConversationService;
import in.praladneupane.chat.common.dto.response.APIResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
public class ConversationController {
    private final ConversationService conversationService;

    @PostMapping("/otherUserId")
    public ResponseEntity<APIResponse<ConversationResponse>> createOrGetConversation(@PathVariable UUID otherUserId,
                                                                                     @AuthenticationPrincipal UserPrincipal userPrincipal, Principal principal){
        ConversationResponse conversationResponse = conversationService.getOrCreateConversation(userPrincipal.getId(), otherUserId);

        APIResponse<ConversationResponse> apiResponse = APIResponse.<ConversationResponse>builder()
                .success(true)
                .data(conversationResponse)
                .message("Conversation retrieved successfully")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    public ResponseEntity<APIResponse<>>
}

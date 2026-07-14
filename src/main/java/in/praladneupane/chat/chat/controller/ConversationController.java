package in.praladneupane.chat.chat.controller;

import in.praladneupane.chat.auth.security.UserPrincipal;
import in.praladneupane.chat.chat.dto.response.ConversationResponse;
import in.praladneupane.chat.chat.service.ConversationService;
import in.praladneupane.chat.common.dto.request.PaginationRequest;
import in.praladneupane.chat.common.dto.response.APIResponse;
import in.praladneupane.chat.common.dto.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
public class ConversationController {
    private final ConversationService conversationService;

    @PostMapping("/{otherUserId}")
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

    public ResponseEntity<APIResponse<PagedResponse<ConversationResponse>>> getAllConversations(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @ModelAttribute PaginationRequest paginationRequest
            ){
        Page<ConversationResponse> conversationPage = conversationService.getAllConversations(userPrincipal.getId(), paginationRequest.toPageable());
        PagedResponse<ConversationResponse> pagedResponse = PagedResponse.from(conversationPage);
        APIResponse<PagedResponse<ConversationResponse>> apiResponse = APIResponse.<PagedResponse<ConversationResponse>>builder()
                .success(true)
                .message("Conversations fetched successfully")
                .data(pagedResponse)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}

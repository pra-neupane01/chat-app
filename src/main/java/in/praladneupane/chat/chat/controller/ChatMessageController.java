package in.praladneupane.chat.chat.controller;

import in.praladneupane.chat.auth.security.UserPrincipal;
import in.praladneupane.chat.chat.dto.request.ChatMessageRequest;
import in.praladneupane.chat.chat.dto.response.ChatMessageResponse;
import in.praladneupane.chat.chat.dto.response.MessageReadReceiptResponse;
import in.praladneupane.chat.chat.dto.response.UnreadCountResponse;
import in.praladneupane.chat.chat.service.ChatMessageService;
import in.praladneupane.chat.common.dto.request.PaginationRequest;
import in.praladneupane.chat.common.dto.response.APIResponse;
import in.praladneupane.chat.common.dto.response.PagedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class ChatMessageController {
    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping({"/chat.send", "/chat.sendMessage"})
    public void sendMessage(
            @Valid @Payload ChatMessageRequest request,
            Principal principal
    ) {

        if (!(principal instanceof Authentication authentication)
                || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new AccessDeniedException(
                    "Unauthenticated WebSocket connection"
            );
        }

        ChatMessageResponse response = chatMessageService.sendMessage(
                request,
                userPrincipal.getId()
        );

        String receiverPrincipalName =
                chatMessageService.getUserPrincipalName(response.receiverId());

        String senderPrincipalName =
                chatMessageService.getUserPrincipalName(response.senderId());

        simpMessagingTemplate.convertAndSendToUser(
                receiverPrincipalName,
                "/queue/messages",
                response
        );

        simpMessagingTemplate.convertAndSendToUser(
                senderPrincipalName,
                "/queue/messages",
                response
        );
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<APIResponse<PagedResponse<ChatMessageResponse>>> getConversationHistory(
            @PathVariable UUID conversationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @ModelAttribute PaginationRequest paginationRequest
    ) {
        Page<ChatMessageResponse> messagePage =
                chatMessageService.getConversationHistory(
                        conversationId,
                        userPrincipal.getId(),
                        paginationRequest.toPageable()
                );

        return ResponseEntity.ok(
                APIResponse.success(
                        "Conversation history fetched successfully",
                        PagedResponse.from(messagePage)
                )
        );
    }

    @GetMapping("/unread-count")
    public ResponseEntity<APIResponse<UnreadCountResponse>> getTotalUnreadCount(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return ResponseEntity.ok(
                APIResponse.success(
                        "Unread message count fetched successfully",
                        chatMessageService.getTotalUnreadCount(userPrincipal.getId())
                )
        );
    }

    @GetMapping("/conversations/{conversationId}/unread-count")
    public ResponseEntity<APIResponse<UnreadCountResponse>> getConversationUnreadCount(
            @PathVariable UUID conversationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return ResponseEntity.ok(
                APIResponse.success(
                        "Conversation unread count fetched successfully",
                        chatMessageService.getConversationUnreadCount(
                                conversationId,
                                userPrincipal.getId()
                        )
                )
        );
    }

    @PatchMapping("/conversations/{conversationId}/read")
    public ResponseEntity<APIResponse<MessageReadReceiptResponse>> markConversationAsRead(
            @PathVariable UUID conversationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        MessageReadReceiptResponse response =
                chatMessageService.markConversationAsRead(
                        conversationId,
                        userPrincipal.getId()
                );

        if (!response.messageIds().isEmpty()) {
            String senderPrincipalName =
                    chatMessageService.getUserPrincipalName(response.senderId());

            simpMessagingTemplate.convertAndSendToUser(
                    senderPrincipalName,
                    "/queue/read-receipts",
                    response
            );
        }

        APIResponse<MessageReadReceiptResponse> apiResponse =
                APIResponse.<MessageReadReceiptResponse>builder()
                        .success(true)
                        .message("Messages marked as read successfully")
                        .data(response)
                        .timestamp(LocalDateTime.now())
                        .build();

        return ResponseEntity.ok(apiResponse);
    }
}

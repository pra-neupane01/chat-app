package in.praladneupane.chat.chat.controller;

import in.praladneupane.chat.auth.security.UserPrincipal;
import in.praladneupane.chat.chat.dto.request.ChatMessageRequest;
import in.praladneupane.chat.chat.dto.request.EditMessageRequest;
import in.praladneupane.chat.chat.dto.request.TypingIndicatorRequest;
import in.praladneupane.chat.chat.dto.response.ChatMessageResponse;
import in.praladneupane.chat.chat.dto.response.CursorPageResponse;
import in.praladneupane.chat.chat.dto.response.MessageDeletionResponse;
import in.praladneupane.chat.chat.dto.response.MessageReadReceiptResponse;
import in.praladneupane.chat.chat.dto.response.TypingIndicatorResponse;
import in.praladneupane.chat.chat.dto.response.UnreadCountResponse;
import in.praladneupane.chat.chat.dto.response.WebSocketErrorResponse;
import in.praladneupane.chat.chat.model.MessageType;
import in.praladneupane.chat.chat.service.ChatMessageService;
import in.praladneupane.chat.common.dto.request.PaginationRequest;
import in.praladneupane.chat.common.dto.response.APIResponse;
import in.praladneupane.chat.common.dto.response.PagedResponse;
import in.praladneupane.chat.common.exception.BusinessException;
import in.praladneupane.chat.common.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.dao.DataAccessException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.converter.MessageConversionException;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

        UserPrincipal userPrincipal = getAuthenticatedPrincipal(principal);

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

    @MessageMapping("/chat.typing")
    public void sendTypingIndicator(
            @Valid @Payload TypingIndicatorRequest request,
            Principal principal
    ) {
        UserPrincipal userPrincipal = getAuthenticatedPrincipal(principal);

        TypingIndicatorResponse response =
                chatMessageService.createTypingIndicator(
                        request,
                        userPrincipal.getId()
                );

        String receiverPrincipalName =
                chatMessageService.getUserPrincipalName(response.receiverId());

        simpMessagingTemplate.convertAndSendToUser(
                receiverPrincipalName,
                "/queue/typing",
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

    @GetMapping("/conversations/{conversationId}/cursor")
    public ResponseEntity<APIResponse<CursorPageResponse<ChatMessageResponse>>> getConversationHistoryBefore(
            @PathVariable UUID conversationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime before,
            @RequestParam(required = false) Integer size
    ) {
        CursorPageResponse<ChatMessageResponse> response =
                chatMessageService.getConversationHistoryBefore(
                        conversationId,
                        userPrincipal.getId(),
                        before,
                        size
                );

        return ResponseEntity.ok(
                APIResponse.success(
                        "Conversation history fetched successfully",
                        response
                )
        );
    }

    @PostMapping(
            value = "/attachments",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<APIResponse<ChatMessageResponse>> uploadAttachment(
            @RequestParam UUID conversationId,
            @RequestParam UUID receiverId,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) MessageType messageType,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        ChatMessageResponse response = chatMessageService.sendAttachment(
                conversationId,
                receiverId,
                content,
                messageType,
                file,
                userPrincipal.getId()
        );

        sendToUser(response.receiverId(), "/queue/messages", response);
        sendToUser(response.senderId(), "/queue/messages", response);

        return ResponseEntity.ok(
                APIResponse.success(
                        "Attachment message sent successfully",
                        response
                )
        );
    }

    @PatchMapping("/{messageId}")
    public ResponseEntity<APIResponse<ChatMessageResponse>> editMessage(
            @PathVariable UUID messageId,
            @Valid @RequestBody EditMessageRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        ChatMessageResponse response =
                chatMessageService.editMessage(
                        messageId,
                        request,
                        userPrincipal.getId()
                );

        sendToUser(response.receiverId(), "/queue/message-updates", response);

        return ResponseEntity.ok(
                APIResponse.success(
                        "Message edited successfully",
                        response
                )
        );
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<APIResponse<MessageDeletionResponse>> deleteMessage(
            @PathVariable UUID messageId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        MessageDeletionResponse response =
                chatMessageService.deleteMessage(
                        messageId,
                        userPrincipal.getId()
                );

        sendToUser(response.receiverId(), "/queue/message-deletions", response);

        return ResponseEntity.ok(
                APIResponse.success(
                        "Message deleted successfully",
                        response
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

    @MessageExceptionHandler(Exception.class)
    @SendToUser(value = "/queue/errors", broadcast = false)
    public WebSocketErrorResponse handleWebSocketException(Exception exception) {
        return WebSocketErrorResponse.builder()
                .type(resolveErrorType(exception))
                .message(resolveErrorMessage(exception))
                .timestamp(LocalDateTime.now())
                .build();
    }

    private UserPrincipal getAuthenticatedPrincipal(Principal principal) {
        if (principal instanceof Authentication authentication
                && authentication.getPrincipal() instanceof UserPrincipal userPrincipal) {
            return userPrincipal;
        }

        throw new AccessDeniedException("Unauthenticated WebSocket connection");
    }

    private void sendToUser(
            UUID userId,
            String destination,
            Object payload
    ) {
        String principalName = chatMessageService.getUserPrincipalName(userId);

        simpMessagingTemplate.convertAndSendToUser(
                principalName,
                destination,
                payload
        );
    }

    private String resolveErrorType(Exception exception) {
        if (exception instanceof AccessDeniedException) {
            return "ACCESS_DENIED";
        }

        if (exception instanceof ResourceNotFoundException) {
            return "NOT_FOUND";
        }

        if (exception instanceof BusinessException) {
            return "BUSINESS_ERROR";
        }

        if (exception instanceof MessageConversionException
                || exception instanceof MethodArgumentNotValidException
                || exception instanceof BindException) {
            return "MALFORMED_MESSAGE";
        }

        if (exception instanceof DataAccessException) {
            return "DATABASE_ERROR";
        }

        return "INTERNAL_ERROR";
    }

    private String resolveErrorMessage(Exception exception) {
        if (exception instanceof DataAccessException) {
            return "Database operation failed";
        }

        if (exception.getMessage() == null || exception.getMessage().isBlank()) {
            return "WebSocket message failed";
        }

        return exception.getMessage();
    }
}

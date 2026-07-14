package in.praladneupane.chat.chat.controller;

import in.praladneupane.chat.auth.security.UserPrincipal;
import in.praladneupane.chat.chat.dto.request.ChatMessageRequest;
import in.praladneupane.chat.chat.dto.response.ChatMessageResponse;
import in.praladneupane.chat.chat.model.ChatMessage;
import in.praladneupane.chat.chat.service.ChatMessageService;
import in.praladneupane.chat.common.dto.response.APIResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.AccessDeniedException;
import java.security.Principal;

@Controller
@RequestMapping("/messages")
@RequiredArgsConstructor
public class ChatMessageController {
    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate simpMessagingTemplate;


    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public void sendMessage(@Valid @Payload ChatMessageRequest request, Principal principal) throws AccessDeniedException {

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

        simpMessagingTemplate.convertAndSend(
                "/topic/conversations/" + response.conversationId(),
                response
        );
    }

}

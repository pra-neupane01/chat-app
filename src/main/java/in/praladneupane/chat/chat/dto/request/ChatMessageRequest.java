package in.praladneupane.chat.chat.dto.request;

import in.praladneupane.chat.chat.model.MessageType;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

import java.util.UUID;

@Builder
public record ChatMessageRequest(
        @NotBlank(message = "conversation id is required")
        UUID conversationId,

        @NotBlank(message = "receiver id is required")
        UUID receiverId,

        @NotBlank(message = "content is required")
        String content,

        MessageType messageType) {
}

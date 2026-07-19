package in.praladneupane.chat.chat.dto.request;

import in.praladneupane.chat.chat.model.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.UUID;

@Builder
public record ChatMessageRequest(
        @NotNull(message = "conversation id is required")
        UUID conversationId,

        @NotNull(message = "receiver id is required")
        UUID receiverId,

        @NotBlank(message = "content is required")
        String content,

        MessageType messageType) {
}

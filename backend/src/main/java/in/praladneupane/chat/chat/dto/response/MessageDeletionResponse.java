package in.praladneupane.chat.chat.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record MessageDeletionResponse(
        UUID messageId,
        UUID conversationId,
        UUID senderId,
        UUID receiverId,
        LocalDateTime deletedAt
) {
}

package in.praladneupane.chat.chat.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record TypingIndicatorResponse(
        UUID conversationId,
        UUID senderId,
        UUID receiverId,
        boolean typing,
        LocalDateTime timestamp
) {
}

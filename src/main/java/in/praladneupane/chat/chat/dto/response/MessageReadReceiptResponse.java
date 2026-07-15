package in.praladneupane.chat.chat.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record MessageReadReceiptResponse(
        UUID conversationId,
        UUID senderId,
        UUID readerId,
        List<UUID> messageIds,
        LocalDateTime readAt
) {
}

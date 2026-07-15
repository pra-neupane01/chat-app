package in.praladneupane.chat.chat.dto.response;

import lombok.Builder;

import java.util.UUID;

@Builder
public record UnreadCountResponse(
        UUID conversationId,
        long unreadCount
) {
}

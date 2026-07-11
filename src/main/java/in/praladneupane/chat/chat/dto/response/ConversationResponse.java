package in.praladneupane.chat.chat.dto.response;

import in.praladneupane.chat.user.dto.response.UserSearchResponse;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record ConversationResponse(
        UUID id,
        UserSearchResponse otherUser,
        LocalDateTime createdAt) {
}

package in.praladneupane.chat.user.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record UserSearchResponse(
        UUID id,
        String fullName,
        String userName,
        String profileImage,
        Boolean onlineStatus,
        LocalDateTime lastSeenAt
) {
}

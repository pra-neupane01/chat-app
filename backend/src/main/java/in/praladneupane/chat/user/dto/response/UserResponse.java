package in.praladneupane.chat.user.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record UserResponse(
        UUID id,
        String fullName,
        String userName,
        String email,
        String profileImage,
        Boolean onlineStatus,
        LocalDateTime lastSeenAt,
        LocalDateTime createdAt) {
}

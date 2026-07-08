package in.praladneupane.chat.user.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String fullName,
        String email,
        String profileImage,
        Boolean onlineStatus,
        LocalDateTime lastSeenAt,
        LocalDateTime createdAt) {

}

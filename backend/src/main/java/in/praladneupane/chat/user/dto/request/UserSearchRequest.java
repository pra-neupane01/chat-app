package in.praladneupane.chat.user.dto.request;

import java.util.UUID;

public record UserSearchRequest(
        UUID id,
        String username,
        String fullName
) {
}

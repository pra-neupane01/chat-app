package in.praladneupane.chat.auth.dto.response;

import lombok.Builder;

import java.util.UUID;

@Builder
public record AuthResponse(
        String token,
        UUID userId,
        String fullName,
        String email
) {

}

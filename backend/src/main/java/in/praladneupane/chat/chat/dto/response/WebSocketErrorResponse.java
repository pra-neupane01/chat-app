package in.praladneupane.chat.chat.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record WebSocketErrorResponse(
        String type,
        String message,
        LocalDateTime timestamp
) {
}

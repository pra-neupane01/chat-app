package in.praladneupane.chat.chat.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.UUID;

@Builder
public record TypingIndicatorRequest(
        @NotNull(message = "conversation id is required")
        UUID conversationId,

        boolean typing
) {
}

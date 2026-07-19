package in.praladneupane.chat.chat.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record EditMessageRequest(
        @NotBlank(message = "content is required")
        String content
) {
}

package in.praladneupane.chat.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid Email")
        String email,

        @NotBlank(message = "Password is required")
        String password
) {
}

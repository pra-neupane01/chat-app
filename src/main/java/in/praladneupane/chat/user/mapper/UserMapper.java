package in.praladneupane.chat.user.mapper;

import in.praladneupane.chat.auth.dto.request.RegisterRequest;
import in.praladneupane.chat.user.dto.response.UserResponse;
import in.praladneupane.chat.user.model.User;

public class UserMapper {
    public static User toEntity(RegisterRequest request){
        return User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .build();

    }

    public static UserResponse toResponse(User user){
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .onlineStatus(user.getOnlineStatus())
                .lastSeenAt(user.getLastSeenAt())
                .build();

    }
}

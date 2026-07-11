package in.praladneupane.chat.chat.mapper;

import in.praladneupane.chat.chat.dto.response.ConversationResponse;
import in.praladneupane.chat.chat.model.Conversation;
import in.praladneupane.chat.user.dto.response.UserSearchResponse;
import in.praladneupane.chat.user.model.User;

public class ConversationMapper {
    public static ConversationResponse toResponse(Conversation conversation,
                                                  User otherUser){
        return ConversationResponse.builder()
                .id(conversation.getId())
                .otherUser(UserSearchResponse.builder()
                        .id(otherUser.getId())
                        .userName(otherUser.getUsername())
                        .fullName(otherUser.getFullName())
                        .profileImage(otherUser.getProfileImage())
                        .onlineStatus(otherUser.getOnlineStatus())
                        .lastSeenAt(otherUser.getLastSeenAt())
                        .build())
                .createdAt(conversation.getCreatedAt())
                .build();
    }
}

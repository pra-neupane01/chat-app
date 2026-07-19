package in.praladneupane.chat.chat.mapper;

import in.praladneupane.chat.chat.dto.response.ConversationResponse;
import in.praladneupane.chat.chat.model.ChatMessage;
import in.praladneupane.chat.chat.model.Conversation;
import in.praladneupane.chat.user.dto.response.UserSearchResponse;
import in.praladneupane.chat.user.model.User;

public class ConversationMapper {
    public static ConversationResponse toResponse(Conversation conversation,
                                                  User otherUser){
        return toResponse(conversation, otherUser, null, 0L);
    }

    public static ConversationResponse toResponse(
            Conversation conversation,
            User otherUser,
            ChatMessage lastMessage,
            long unreadCount
    ) {
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
                .lastMessage(lastMessage == null ? null : lastMessage.getContent())
                .lastMessageTime(lastMessage == null ? null : lastMessage.getSentAt())
                .unreadCount(unreadCount)
                .createdAt(conversation.getCreatedAt())
                .build();
    }
}

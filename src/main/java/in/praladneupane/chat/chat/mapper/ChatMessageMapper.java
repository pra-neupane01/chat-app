package in.praladneupane.chat.chat.mapper;

import in.praladneupane.chat.chat.dto.request.ChatMessageRequest;
import in.praladneupane.chat.chat.dto.response.ChatMessageResponse;
import in.praladneupane.chat.chat.model.ChatMessage;
import in.praladneupane.chat.chat.model.Conversation;
import in.praladneupane.chat.chat.model.MessageStatus;
import in.praladneupane.chat.chat.model.MessageType;
import in.praladneupane.chat.user.model.User;

import java.time.LocalDateTime;

public final class ChatMessageMapper {

    private ChatMessageMapper() {
    }

    public static ChatMessage toEntity(
            ChatMessageRequest request,
            Conversation conversation,
            User sender,
            User receiver
    ) {
        return ChatMessage.builder()
                .conversation(conversation)
                .sender(sender)
                .receiver(receiver)
                .content(request.content())
                .messageType(request.messageType() == null
                        ? MessageType.TEXT
                        : request.messageType())
                .messageStatus(MessageStatus.SENT)
                .sentAt(LocalDateTime.now())
                .build();
    }

    public static ChatMessageResponse toResponse(ChatMessage chatMessage) {
        return ChatMessageResponse.builder()
                .id(chatMessage.getId())
                .conversationId(chatMessage.getConversation().getId())
                .senderId(chatMessage.getSender().getId())
                .senderName(chatMessage.getSender().getFullName())
                .receiverId(chatMessage.getReceiver().getId())
                .content(chatMessage.getContent())
                .messageType(chatMessage.getMessageType())
                .messageStatus(chatMessage.getMessageStatus())
                .sentAt(chatMessage.getSentAt())
                .readAt(chatMessage.getReadAt())
                .build();
    }
}

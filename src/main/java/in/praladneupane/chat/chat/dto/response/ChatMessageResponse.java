package in.praladneupane.chat.chat.dto.response;

import in.praladneupane.chat.chat.model.MessageStatus;
import in.praladneupane.chat.chat.model.MessageType;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record ChatMessageResponse(
        UUID id,
        UUID conversationId,

        UUID senderId,
        String senderName,

        UUID receiverId,

        String content,
        MessageType messageType,
        MessageStatus messageStatus,

        LocalDateTime sentAt
        ) {
}

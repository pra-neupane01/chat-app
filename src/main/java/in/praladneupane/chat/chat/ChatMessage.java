package in.praladneupane.chat.chat;

import in.praladneupane.chat.chat.model.Conversation;
import in.praladneupane.chat.chat.model.MessageStatus;
import in.praladneupane.chat.chat.model.MessageType;
import in.praladneupane.chat.common.model.BaseEntity;
import in.praladneupane.chat.user.model.User;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "chat_message")
public class ChatMessage extends BaseEntity {
    private Conversation conversation;
    private String content;
    private User sender;
    private User receiver;
    private MessageType messageType;
    private MessageStatus messageStatus;

}

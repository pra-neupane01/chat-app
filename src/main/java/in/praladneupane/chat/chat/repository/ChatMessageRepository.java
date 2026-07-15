package in.praladneupane.chat.chat.repository;

import in.praladneupane.chat.chat.model.ChatMessage;
import in.praladneupane.chat.chat.model.MessageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    Page<ChatMessage> findByConversation_Id(UUID conversationId, Pageable pageable);

    Optional<ChatMessage> findTopByConversation_IdOrderBySentAtDesc(UUID conversationId);

    // Count unread messages for a particular user in a conversation
    long countByConversation_IdAndReceiver_IdAndMessageStatusNot(
            UUID conversationId,
            UUID receiverId,
            MessageStatus messageStatus
    );

    long countByReceiver_IdAndMessageStatusNot(
            UUID receiverId,
            MessageStatus messageStatus
    );

    List<ChatMessage> findByConversation_IdAndReceiver_IdAndMessageStatusNot(
            UUID conversationId,
            UUID receiverId,
            MessageStatus messageStatus
    );

    @Query("""
            select message
            from ChatMessage message
            where message.conversation.id = :conversationId
              and (:beforeSentAt is null or message.sentAt < :beforeSentAt)
            order by message.sentAt desc
            """)
    List<ChatMessage> findConversationMessagesBefore(
            @Param("conversationId") UUID conversationId,
            @Param("beforeSentAt") LocalDateTime beforeSentAt,
            Pageable pageable
    );
}

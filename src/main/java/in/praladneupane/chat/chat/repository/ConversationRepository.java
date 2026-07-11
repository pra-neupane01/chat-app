package in.praladneupane.chat.chat.repository;

import in.praladneupane.chat.chat.model.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    Optional<Conversation> findByUserOneIdAndUserTwoId(UUID userOneId, UUID userTwoId);
    Page<Conversation> findByUserOneIdOrUserTwoId(UUID userOneId, UUID userTwoId, Pageable pageable);
}
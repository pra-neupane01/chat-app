package in.praladneupane.chat.chat.service;

import in.praladneupane.chat.chat.dto.response.ConversationResponse;
import in.praladneupane.chat.chat.mapper.ConversationMapper;
import in.praladneupane.chat.chat.model.ChatMessage;
import in.praladneupane.chat.chat.model.Conversation;
import in.praladneupane.chat.chat.model.MessageStatus;
import in.praladneupane.chat.chat.repository.ChatMessageRepository;
import in.praladneupane.chat.chat.repository.ConversationRepository;
import in.praladneupane.chat.common.exception.ResourceNotFoundException;
import in.praladneupane.chat.user.model.User;
import in.praladneupane.chat.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConversationService {
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Transactional
    public ConversationResponse getOrCreateConversation(UUID currentUserId,
                                                        UUID otherUserId){
        if (currentUserId.equals(otherUserId)){
            throw new IllegalArgumentException("You cannot start a conversation with yourself");
        }

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Other user not found"));

        User userOne;
        User userTwo;

        if(currentUserId.compareTo(otherUserId) < 0){
            userOne = currentUser;
            userTwo = otherUser;
        }else {
            userOne = otherUser;
            userTwo = currentUser;
        }

        Conversation conversation = conversationRepository.findByUserOneIdAndUserTwoId(userOne.getId(), userTwo.getId())
                .orElseGet(() -> conversationRepository.save(Conversation.builder()
                        .userOne(userOne)
                        .userTwo(userTwo)
                        .build()));
        return toConversationResponse(
                conversation,
                otherUser,
                currentUserId
        );
    }


    @Transactional(readOnly = true)
    public Page<ConversationResponse> getAllConversations(UUID authenticatedUserId,
                                                          Pageable pageable){

        Page<Conversation> conversationPage = conversationRepository.findByUserOneIdOrUserTwoId(authenticatedUserId, authenticatedUserId, pageable);
        return conversationPage.map(conversation -> {
            User otherUser = conversation.getUserOne().getId().equals(authenticatedUserId)
                    ? conversation.getUserTwo()
                    : conversation.getUserOne();

            return toConversationResponse(
                    conversation,
                    otherUser,
                    authenticatedUserId
            );
        });
    }

    private ConversationResponse toConversationResponse(
            Conversation conversation,
            User otherUser,
            UUID authenticatedUserId
    ) {
        Optional<ChatMessage> lastMessage =
                chatMessageRepository.findTopByConversation_IdOrderBySentAtDesc(
                        conversation.getId()
                );

        long unreadCount =
                chatMessageRepository.countByConversation_IdAndReceiver_IdAndMessageStatusNot(
                        conversation.getId(),
                        authenticatedUserId,
                        MessageStatus.READ
                );

        return ConversationMapper.toResponse(
                conversation,
                otherUser,
                lastMessage.orElse(null),
                unreadCount
        );
    }
}

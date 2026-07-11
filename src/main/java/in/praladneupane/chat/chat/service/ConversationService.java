package in.praladneupane.chat.chat.service;

import in.praladneupane.chat.chat.dto.response.ConversationResponse;
import in.praladneupane.chat.chat.mapper.ConversationMapper;
import in.praladneupane.chat.chat.model.Conversation;
import in.praladneupane.chat.chat.repository.ConversationRepository;
import in.praladneupane.chat.common.exception.ResourceNotFoundException;
import in.praladneupane.chat.user.model.User;
import in.praladneupane.chat.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConversationService {
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

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
        return ConversationMapper.toResponse(conversation, otherUser);
    }


    @Transactional
    public Page<ConversationResponse> getAllConversations(Pageable pageable){
        Page<Conversation> conversationPage = conversationRepository.findAll(pageable);



    }
}

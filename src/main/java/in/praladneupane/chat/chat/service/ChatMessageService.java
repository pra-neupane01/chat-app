package in.praladneupane.chat.chat.service;

import in.praladneupane.chat.chat.dto.request.ChatMessageRequest;
import in.praladneupane.chat.chat.dto.response.ChatMessageResponse;
import in.praladneupane.chat.chat.mapper.ChatMessageMapper;
import in.praladneupane.chat.chat.model.ChatMessage;
import in.praladneupane.chat.chat.model.Conversation;
import in.praladneupane.chat.chat.repository.ChatMessageRepository;
import in.praladneupane.chat.chat.repository.ConversationRepository;
import in.praladneupane.chat.common.exception.BusinessException;
import in.praladneupane.chat.common.exception.ResourceNotFoundException;
import in.praladneupane.chat.user.model.User;
import in.praladneupane.chat.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
    private final ChatMessageRepository chatMessageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    public ChatMessageResponse sendMessage(ChatMessageRequest request, UUID authenticatedUserId){
        Conversation conversation = conversationRepository.findById(request.conversationId()).orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        User sender = userRepository.findById(authenticatedUserId).orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

        User receiver = userRepository.findById(request.receiverId()).orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        boolean senderIsParticipant = conversation.getUserOne().getId().equals(sender.getId())
                || conversation.getUserTwo().getId().equals(sender.getId());

        if(!senderIsParticipant){
            throw new BusinessException("You are not participant of this conversation.");
        }

        boolean receiverIsParticipant = conversation.getUserOne().getId().equals(receiver.getId())
                || conversation.getUserTwo().getId().equals(receiver.getId());

        if(!receiverIsParticipant){
            throw new BusinessException("You are not participant of this conversation");
        }

        if(sender.getId().equals(receiver.getId())){
            throw new BusinessException("You cannot send message to yourself");
        }

        ChatMessage chatMessage = ChatMessageMapper.toEntity(request, conversation, sender, receiver);

        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

        return ChatMessageMapper.toResponse(savedMessage);
    }
}

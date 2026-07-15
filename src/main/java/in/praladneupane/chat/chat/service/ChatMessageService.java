package in.praladneupane.chat.chat.service;

import in.praladneupane.chat.chat.dto.request.ChatMessageRequest;
import in.praladneupane.chat.chat.dto.response.ChatMessageResponse;
import in.praladneupane.chat.chat.dto.response.MessageReadReceiptResponse;
import in.praladneupane.chat.chat.dto.response.UnreadCountResponse;
import in.praladneupane.chat.chat.mapper.ChatMessageMapper;
import in.praladneupane.chat.chat.model.ChatMessage;
import in.praladneupane.chat.chat.model.Conversation;
import in.praladneupane.chat.chat.model.MessageStatus;
import in.praladneupane.chat.chat.repository.ChatMessageRepository;
import in.praladneupane.chat.chat.repository.ConversationRepository;
import in.praladneupane.chat.common.exception.BusinessException;
import in.praladneupane.chat.common.exception.ResourceNotFoundException;
import in.praladneupane.chat.user.model.User;
import in.praladneupane.chat.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
    private final ChatMessageRepository chatMessageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatMessageResponse sendMessage(
            ChatMessageRequest request,
            UUID authenticatedUserId
    ) {
        Conversation conversation = getConversationForParticipant(
                request.conversationId(),
                authenticatedUserId
        );

        User sender = userRepository.findById(authenticatedUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Sender not found")
                );

        User receiver = userRepository.findById(request.receiverId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Receiver not found")
                );

        boolean receiverIsParticipant = conversation.getUserOne().getId().equals(receiver.getId())
                || conversation.getUserTwo().getId().equals(receiver.getId());

        if (!receiverIsParticipant) {
            throw new BusinessException("Receiver is not participant of this conversation");
        }

        if (sender.getId().equals(receiver.getId())) {
            throw new BusinessException("You cannot send message to yourself");
        }

        ChatMessage chatMessage = ChatMessageMapper.toEntity(request, conversation, sender, receiver);

        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

        return ChatMessageMapper.toResponse(savedMessage);
    }

    @Transactional(readOnly = true)
    public Page<ChatMessageResponse> getConversationHistory(
            UUID conversationId,
            UUID authenticatedUserId,
            Pageable pageable
    ) {
        getConversationForParticipant(conversationId, authenticatedUserId);

        return chatMessageRepository
                .findByConversation_Id(conversationId, pageable)
                .map(ChatMessageMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse getConversationUnreadCount(
            UUID conversationId,
            UUID authenticatedUserId
    ) {
        getConversationForParticipant(conversationId, authenticatedUserId);

        long unreadCount =
                chatMessageRepository.countByConversation_IdAndReceiver_IdAndMessageStatusNot(
                        conversationId,
                        authenticatedUserId,
                        MessageStatus.READ
                );

        return UnreadCountResponse.builder()
                .conversationId(conversationId)
                .unreadCount(unreadCount)
                .build();
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse getTotalUnreadCount(UUID authenticatedUserId) {
        long unreadCount =
                chatMessageRepository.countByReceiver_IdAndMessageStatusNot(
                        authenticatedUserId,
                        MessageStatus.READ
                );

        return UnreadCountResponse.builder()
                .unreadCount(unreadCount)
                .build();
    }

    @Transactional
    public MessageReadReceiptResponse markConversationAsRead(
            UUID conversationId,
            UUID authenticatedUserId
    ) {
        Conversation conversation = getConversationForParticipant(
                conversationId,
                authenticatedUserId
        );

        User otherParticipant = getOtherParticipant(
                conversation,
                authenticatedUserId
        );

        List<ChatMessage> unreadMessages =
                chatMessageRepository.findByConversation_IdAndReceiver_IdAndMessageStatusNot(
                        conversationId,
                        authenticatedUserId,
                        MessageStatus.READ
                );

        LocalDateTime readAt = LocalDateTime.now();

        unreadMessages.forEach(message -> {
            message.setMessageStatus(MessageStatus.READ);
            message.setReadAt(readAt);
        });

        List<UUID> messageIds = unreadMessages
                .stream()
                .map(ChatMessage::getId)
                .toList();

        return MessageReadReceiptResponse.builder()
                .conversationId(conversationId)
                .senderId(otherParticipant.getId())
                .readerId(authenticatedUserId)
                .messageIds(messageIds)
                .readAt(readAt)
                .build();
    }

    @Transactional(readOnly = true)
    public String getUserPrincipalName(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getEmail();
    }

    private Conversation getConversationForParticipant(
            UUID conversationId,
            UUID authenticatedUserId
    ) {
        Conversation conversation = conversationRepository
                .findById(conversationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Conversation not found")
                );

        boolean participant =
                conversation.getUserOne().getId().equals(authenticatedUserId)
                        || conversation.getUserTwo().getId().equals(authenticatedUserId);

        if (!participant) {
            throw new BusinessException("You are not participant of this conversation.");
        }

        return conversation;
    }

    private User getOtherParticipant(
            Conversation conversation,
            UUID authenticatedUserId
    ) {
        return conversation.getUserOne().getId().equals(authenticatedUserId)
                ? conversation.getUserTwo()
                : conversation.getUserOne();
    }
}

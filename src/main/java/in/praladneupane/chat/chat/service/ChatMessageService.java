package in.praladneupane.chat.chat.service;

import in.praladneupane.chat.chat.dto.request.ChatMessageRequest;
import in.praladneupane.chat.chat.dto.request.EditMessageRequest;
import in.praladneupane.chat.chat.dto.request.TypingIndicatorRequest;
import in.praladneupane.chat.chat.dto.response.ChatMessageResponse;
import in.praladneupane.chat.chat.dto.response.CursorPageResponse;
import in.praladneupane.chat.chat.dto.response.MessageDeletionResponse;
import in.praladneupane.chat.chat.dto.response.MessageReadReceiptResponse;
import in.praladneupane.chat.chat.dto.response.TypingIndicatorResponse;
import in.praladneupane.chat.chat.dto.response.UnreadCountResponse;
import in.praladneupane.chat.chat.mapper.ChatMessageMapper;
import in.praladneupane.chat.chat.model.ChatMessage;
import in.praladneupane.chat.chat.model.Conversation;
import in.praladneupane.chat.chat.model.MessageStatus;
import in.praladneupane.chat.chat.model.MessageType;
import in.praladneupane.chat.chat.repository.ChatMessageRepository;
import in.praladneupane.chat.chat.repository.ConversationRepository;
import in.praladneupane.chat.common.exception.BusinessException;
import in.praladneupane.chat.common.exception.ResourceNotFoundException;
import in.praladneupane.chat.user.model.User;
import in.praladneupane.chat.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
    private static final Path ATTACHMENT_UPLOAD_ROOT =
            Paths.get("uploads", "chat")
                    .toAbsolutePath()
                    .normalize();
    private static final String ATTACHMENT_URL_PREFIX = "/uploads/chat/";
    private static final int DEFAULT_CURSOR_SIZE = 20;
    private static final int MAX_CURSOR_SIZE = 100;

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

    @Transactional
    public ChatMessageResponse sendAttachment(
            UUID conversationId,
            UUID receiverId,
            String content,
            MessageType messageType,
            MultipartFile file,
            UUID authenticatedUserId
    ) {
        Conversation conversation = getConversationForParticipant(
                conversationId,
                authenticatedUserId
        );

        User sender = userRepository.findById(authenticatedUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Sender not found")
                );

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Receiver not found")
                );

        validateReceiver(conversation, sender, receiver);

        StoredAttachment attachment = storeAttachment(file);
        String messageContent = content == null || content.isBlank()
                ? attachment.originalFileName()
                : content.trim();

        ChatMessage chatMessage = ChatMessage.builder()
                .conversation(conversation)
                .sender(sender)
                .receiver(receiver)
                .content(messageContent)
                .messageType(resolveAttachmentMessageType(messageType, attachment.contentType()))
                .messageStatus(MessageStatus.SENT)
                .sentAt(LocalDateTime.now())
                .attachmentUrl(attachment.url())
                .attachmentFileName(attachment.originalFileName())
                .attachmentContentType(attachment.contentType())
                .attachmentSize(attachment.size())
                .build();

        return ChatMessageMapper.toResponse(
                chatMessageRepository.save(chatMessage)
        );
    }

    @Transactional(readOnly = true)
    public TypingIndicatorResponse createTypingIndicator(
            TypingIndicatorRequest request,
            UUID authenticatedUserId
    ) {
        Conversation conversation = getConversationForParticipant(
                request.conversationId(),
                authenticatedUserId
        );

        User receiver = getOtherParticipant(
                conversation,
                authenticatedUserId
        );

        return TypingIndicatorResponse.builder()
                .conversationId(request.conversationId())
                .senderId(authenticatedUserId)
                .receiverId(receiver.getId())
                .typing(request.typing())
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Transactional
    public ChatMessageResponse editMessage(
            UUID messageId,
            EditMessageRequest request,
            UUID authenticatedUserId
    ) {
        ChatMessage message = getMessage(messageId);

        if (!message.getSender().getId().equals(authenticatedUserId)) {
            throw new AccessDeniedException("Only the sender can edit this message");
        }

        if (message.isDeleted()) {
            throw new BusinessException("Deleted messages cannot be edited");
        }

        message.setContent(request.content().trim());
        message.setEdited(true);
        message.setEditedAt(LocalDateTime.now());

        return ChatMessageMapper.toResponse(message);
    }

    @Transactional
    public MessageDeletionResponse deleteMessage(
            UUID messageId,
            UUID authenticatedUserId
    ) {
        ChatMessage message = getMessage(messageId);

        if (!message.getSender().getId().equals(authenticatedUserId)) {
            throw new AccessDeniedException("Only the sender can delete this message");
        }

        if (!message.isDeleted()) {
            LocalDateTime deletedAt = LocalDateTime.now();
            message.setDeleted(true);
            message.setDeletedAt(deletedAt);
        }

        return MessageDeletionResponse.builder()
                .messageId(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .receiverId(message.getReceiver().getId())
                .deletedAt(message.getDeletedAt())
                .build();
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
    public CursorPageResponse<ChatMessageResponse> getConversationHistoryBefore(
            UUID conversationId,
            UUID authenticatedUserId,
            LocalDateTime beforeSentAt,
            Integer requestedSize
    ) {
        getConversationForParticipant(conversationId, authenticatedUserId);

        int size = normalizeCursorSize(requestedSize);
        List<ChatMessage> messages =
                chatMessageRepository.findConversationMessagesBefore(
                        conversationId,
                        beforeSentAt,
                        PageRequest.of(0, size + 1)
                );

        boolean hasMore = messages.size() > size;
        List<ChatMessageResponse> content = messages.stream()
                .limit(size)
                .map(ChatMessageMapper::toResponse)
                .toList();

        String nextCursor = hasMore && !content.isEmpty()
                ? content.get(content.size() - 1).sentAt().toString()
                : null;

        return CursorPageResponse.<ChatMessageResponse>builder()
                .content(content)
                .nextCursor(nextCursor)
                .hasMore(hasMore)
                .build();
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

    private ChatMessage getMessage(UUID messageId) {
        return chatMessageRepository.findById(messageId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Message not found")
                );
    }

    private void validateReceiver(
            Conversation conversation,
            User sender,
            User receiver
    ) {
        boolean receiverIsParticipant =
                conversation.getUserOne().getId().equals(receiver.getId())
                        || conversation.getUserTwo().getId().equals(receiver.getId());

        if (!receiverIsParticipant) {
            throw new BusinessException("Receiver is not participant of this conversation");
        }

        if (sender.getId().equals(receiver.getId())) {
            throw new BusinessException("You cannot send message to yourself");
        }
    }

    private StoredAttachment storeAttachment(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Attachment file is required");
        }

        try {
            Files.createDirectories(ATTACHMENT_UPLOAD_ROOT);

            String originalFileName = sanitizeFileName(file.getOriginalFilename());
            String storedFileName = UUID.randomUUID() + "-" + originalFileName;
            Path targetLocation = ATTACHMENT_UPLOAD_ROOT
                    .resolve(storedFileName)
                    .normalize();

            if (!targetLocation.startsWith(ATTACHMENT_UPLOAD_ROOT)) {
                throw new BusinessException("Invalid attachment path");
            }

            Files.copy(
                    file.getInputStream(),
                    targetLocation,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return new StoredAttachment(
                    originalFileName,
                    file.getContentType(),
                    file.getSize(),
                    ATTACHMENT_URL_PREFIX + storedFileName
            );
        } catch (IOException exception) {
            throw new BusinessException("Could not store attachment file");
        }
    }

    private String sanitizeFileName(String originalFileName) {
        String fileName = originalFileName == null || originalFileName.isBlank()
                ? "attachment"
                : Paths.get(originalFileName).getFileName().toString();

        return fileName.replaceAll("[^A-Za-z0-9._-]", "_");
    }

    private MessageType resolveAttachmentMessageType(
            MessageType requestedType,
            String contentType
    ) {
        if (requestedType == MessageType.IMAGE || requestedType == MessageType.FILE) {
            return requestedType;
        }

        return contentType != null && contentType.startsWith("image/")
                ? MessageType.IMAGE
                : MessageType.FILE;
    }

    private int normalizeCursorSize(Integer requestedSize) {
        if (requestedSize == null || requestedSize <= 0) {
            return DEFAULT_CURSOR_SIZE;
        }

        return Math.min(requestedSize, MAX_CURSOR_SIZE);
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
            throw new AccessDeniedException("You are not participant of this conversation.");
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

    private record StoredAttachment(
            String originalFileName,
            String contentType,
            long size,
            String url
    ) {
    }
}

package in.praladneupane.chat.user.service;

import in.praladneupane.chat.common.exception.ResourceNotFoundException;
import in.praladneupane.chat.user.model.User;
import in.praladneupane.chat.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserPresenceService {

    private final UserRepository userRepository;

    @Transactional
    public void markOnline(UUID userId) {
        User user = getUser(userId);
        user.setOnlineStatus(true);
    }

    @Transactional
    public void markOffline(UUID userId) {
        User user = getUser(userId);
        user.setOnlineStatus(false);
        user.setLastSeenAt(LocalDateTime.now());
    }

    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );
    }
}

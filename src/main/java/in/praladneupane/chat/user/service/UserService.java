package in.praladneupane.chat.user.service;

import in.praladneupane.chat.user.dto.request.UserSearchRequest;
import in.praladneupane.chat.user.dto.response.UserSearchResponse;
import in.praladneupane.chat.user.repository.UserRepository;
import in.praladneupane.chat.user.specification.UserSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserSpecification userSpecification;

    public Page<UserSearchResponse> searchUsers(
            UserSearchRequest searchRequest,
            Pageable pageable
    ) {
        return userRepository
                .findAll(UserSpecification.search(searchRequest), pageable)
                .map(user -> UserSearchResponse.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .userName(user.getUsername())
                        .profileImage(user.getProfileImage())
                        .onlineStatus(user.getOnlineStatus())
                        .lastSeenAt(user.getLastSeenAt())
                        .build());
    }
}
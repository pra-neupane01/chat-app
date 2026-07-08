package in.praladneupane.chat.auth.service;

import in.praladneupane.chat.auth.dto.request.RegisterRequest;
import in.praladneupane.chat.common.exception.BusinessException;
import in.praladneupane.chat.user.dto.response.UserResponse;
import in.praladneupane.chat.user.mapper.UserMapper;
import in.praladneupane.chat.user.model.User;
import in.praladneupane.chat.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse registerUser(RegisterRequest request){
        checkUserExists(request);
        User user = UserMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.password()));
        User savedUser = userRepository.save(user);
        return UserMapper.toResponse(savedUser);
    }

    private void checkUserExists(RegisterRequest request) {
        if(userRepository.existsByEmail(request.email())){
            throw new BusinessException("User already exists");
        }
    }
}

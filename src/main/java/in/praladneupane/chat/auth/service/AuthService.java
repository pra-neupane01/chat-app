package in.praladneupane.chat.auth.service;

import in.praladneupane.chat.auth.dto.request.RegisterRequest;
import in.praladneupane.chat.user.dto.response.UserResponse;
import in.praladneupane.chat.user.mapper.UserMapper;
import in.praladneupane.chat.user.model.User;
import in.praladneupane.chat.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RestController;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;

    public UserResponse registerUser(RegisterRequest request){
//        if(userRepository.existsByEmail(request.email())){
//            throw new
//
//        }
        User user = UserMapper.toEntity(request);
        User savedUser = userRepository.save(user);
        return UserMapper.toResponse(savedUser);
    }
}

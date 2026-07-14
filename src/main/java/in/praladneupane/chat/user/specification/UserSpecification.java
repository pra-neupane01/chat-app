package in.praladneupane.chat.user.specification;


import in.praladneupane.chat.user.dto.request.UserSearchRequest;
import in.praladneupane.chat.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {
    public static Specification<User> search(UserSearchRequest request) {
        return (root, query, cb) -> {
            if (request.id() != null) {
                return cb.equal(root.get("id"), request.id());
            }

            if (request.username() != null && !request.username().isBlank()) {
                return cb.equal(
                        cb.lower(root.get("username")),
                        request.username().trim().toLowerCase()
                );
            }

            if (request.fullName() != null && !request.fullName().isBlank()) {
                return cb.like(
                        cb.lower(root.get("fullName")),
                        "%" + request.fullName().trim().toLowerCase() + "%"
                );
            }

            return cb.conjunction();
        };
    }
    }

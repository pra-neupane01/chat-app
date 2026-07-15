package in.praladneupane.chat.user.specification;


import in.praladneupane.chat.user.dto.request.UserSearchRequest;
import in.praladneupane.chat.user.model.User;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class UserSpecification {
    public static Specification<User> search(
            UserSearchRequest request,
            UUID authenticatedUserId
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            List<Predicate> searchPredicates = new ArrayList<>();

            if (authenticatedUserId != null) {
                predicates.add(cb.notEqual(root.get("id"), authenticatedUserId));
            }

            if (request.id() != null) {
                searchPredicates.add(cb.equal(root.get("id"), request.id()));
            }

            if (request.username() != null && !request.username().isBlank()) {
                searchPredicates.add(cb.like(
                        cb.lower(root.get("username")),
                        "%" + request.username().trim().toLowerCase() + "%"
                ));
            }

            if (request.fullName() != null && !request.fullName().isBlank()) {
                searchPredicates.add(cb.like(
                        cb.lower(root.get("fullName")),
                        "%" + request.fullName().trim().toLowerCase() + "%"
                ));
            }

            if (!searchPredicates.isEmpty()) {
                predicates.add(cb.or(searchPredicates.toArray(Predicate[]::new)));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}

package in.praladneupane.chat.user.model;

import in.praladneupane.chat.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(nullable = false, name = "full_name")
    private String fullName;

    @Column(nullable = false, unique = true, name = "email")
    private String email;

    @Column(nullable = false, name = "password")
    private String password;

    @Column(name = "profile_image")
    private String profileImage;

    @Column(name="username", nullable = false, unique = true)
    private String username;

    @Builder.Default
    @Column(nullable = false, name = "online_status")
    private Boolean onlineStatus = false;

    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;
}

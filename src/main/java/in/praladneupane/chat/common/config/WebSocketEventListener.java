package in.praladneupane.chat.common.config;

import in.praladneupane.chat.auth.security.UserPrincipal;
import in.praladneupane.chat.user.service.UserPresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final UserPresenceService userPresenceService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        extractUserPrincipal(event.getUser())
                .ifPresent(userPrincipal ->
                        userPresenceService.markOnline(userPrincipal.getId())
                );
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        extractUserPrincipal(event.getUser())
                .ifPresent(userPrincipal ->
                        userPresenceService.markOffline(userPrincipal.getId())
                );
    }

    private Optional<UserPrincipal> extractUserPrincipal(Principal principal) {
        if (principal instanceof Authentication authentication
                && authentication.getPrincipal() instanceof UserPrincipal userPrincipal) {
            return Optional.of(userPrincipal);
        }

        return Optional.empty();
    }
}

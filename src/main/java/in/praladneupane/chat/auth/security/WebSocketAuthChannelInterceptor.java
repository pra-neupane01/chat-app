package in.praladneupane.chat.auth.security;

import in.praladneupane.chat.auth.security.jwt.JwtService;
import in.praladneupane.chat.auth.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel
    ) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(
                        message,
                        StompHeaderAccessor.class
                );

        if (accessor == null) {
            return message;
        }

        /*
         * Only authenticate when the client first sends
         * the STOMP CONNECT command.
         */
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {

            String authorizationHeader =
                    accessor.getFirstNativeHeader(
                            HttpHeaders.AUTHORIZATION
                    );

            if (!StringUtils.hasText(authorizationHeader)) {
                throw new MessageDeliveryException(
                        "Authorization header is missing"
                );
            }

            if (!authorizationHeader.startsWith("Bearer ")) {
                throw new MessageDeliveryException(
                        "Authorization header must start with Bearer"
                );
            }

            String jwtToken = authorizationHeader.substring(7);

            try {
                /*
                 * The JWT subject contains the user's email.
                 */
                String email = jwtService.extractUserName(jwtToken);

                if (!StringUtils.hasText(email)) {
                    throw new MessageDeliveryException(
                            "JWT does not contain a valid username"
                    );
                }

                /*
                 * Load UserPrincipal from the database.
                 */
                UserDetails userDetails =
                        customUserDetailsService.loadUserByUsername(email);

                /*
                 * Check:
                 * 1. Token belongs to this user.
                 * 2. Token has not expired.
                 * 3. Token signature is valid.
                 */
                boolean tokenValid =
                        jwtService.verifyToken(
                                jwtToken,
                                userDetails.getUsername()
                        );

                if (!tokenValid) {
                    throw new MessageDeliveryException(
                            "JWT token is invalid or expired"
                    );
                }

                /*
                 * Create the authenticated Spring Security object.
                 */
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                /*
                 * Associate this authenticated user with
                 * the WebSocket/STOMP session.
                 */
                accessor.setUser(authentication);

            } catch (MessageDeliveryException exception) {
                throw exception;

            } catch (Exception exception) {
                throw new MessageDeliveryException(
                        message,
                        exception
                );
            }
        }

        return message;
    }
}

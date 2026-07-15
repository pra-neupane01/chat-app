package in.praladneupane.chat.common.config;

import in.praladneupane.chat.auth.security.WebSocketAuthChannelInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthChannelInterceptor
            webSocketAuthChannelInterceptor;

    @Override
    public void registerStompEndpoints(
            StompEndpointRegistry registry
    ) {

        registry
                .addEndpoint("/ws")

                /*
                 * Development configuration.
                 *
                 * Replace "*" with your frontend URL
                 * before production deployment.
                 */
                .setAllowedOriginPatterns("*")

                /*
                 * Enables SockJS fallback support.
                 */
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(
            MessageBrokerRegistry registry
    ) {

        /*
         * Messages sent by the client to:
         *
         * /app/chat.sendMessage
         *
         * are routed to @MessageMapping methods.
         */
        registry.setApplicationDestinationPrefixes("/app");

        /*
         * The broker handles subscriptions beginning with:
         *
         * /topic
         * /user
         */
        registry.enableSimpleBroker(
                "/topic",
                "/user"
        );

        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(
            ChannelRegistration registration
    ) {

        /*
         * Register our JWT interceptor for every
         * inbound STOMP message.
         */
        registration.interceptors(
                webSocketAuthChannelInterceptor
        );
    }
}

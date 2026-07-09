package in.praladneupane.chat.auth.security.jwt;

import in.praladneupane.chat.auth.security.UserPrincipal;
import in.praladneupane.chat.common.config.AppConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final AppConfig appConfig;

    public String generateToken(UserPrincipal userPrincipal) {
        return Jwts.builder()
                .subject(userPrincipal.getUsername()) // email
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + appConfig.getJwt().getExpiry() * 60 * 1000L))
                .claim("id", userPrincipal.getId().toString())
                .claim("fullName", userPrincipal.getFullName())
                .claim("email", userPrincipal.getEmail())
                .signWith(generateKey())
                .compact();
    }

    private SecretKey generateKey() {
        byte[] keyBytes = Decoders.BASE64.decode(appConfig.getJwt().getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUserName(String token) {
        return extractSpecificClaim(token, Claims::getSubject);
    }

    private <T> T extractSpecificClaim(String token, Function<Claims, T> resolver) {
        Claims claims = extractClaims(token);
        return resolver.apply(claims);
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(generateKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Date extractExpiry(String token) {
        return extractSpecificClaim(token, Claims::getExpiration);
    }

    public boolean verifyToken(String token, String email) {
        return extractUserName(token).equals(email)
                && !isTokenExpired(token);
    }

    public boolean isTokenExpired(String token) {
        return extractExpiry(token).before(new Date());
    }
}
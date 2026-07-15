package in.praladneupane.chat.chat.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public record CursorPageResponse<T>(
        List<T> content,
        String nextCursor,
        boolean hasMore
) {
}

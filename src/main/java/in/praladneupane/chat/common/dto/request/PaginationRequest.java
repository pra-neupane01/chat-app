package in.praladneupane.chat.common.dto.request;


import lombok.Builder;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Builder
public record PaginationRequest(
        Integer pageNo,
        Integer pageSize,
        String sortBy,
        String sortDirection
) {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 10;
    private static final String DEFAULT_SORT_BY = "id";
    private static final String DEFAULT_SORT_DIRECTION = "ASC";

    public Pageable toPageable() {

        int page = (pageNo == null || pageNo < 0) ? DEFAULT_PAGE : pageNo;
        int size = (pageSize == null || pageSize <= 0) ? DEFAULT_SIZE : pageSize;

        String sortField = (sortBy == null || sortBy.isBlank())
                ? DEFAULT_SORT_BY
                : sortBy;

        Sort.Direction direction;

        if (sortDirection == null || sortDirection.isBlank()) {
            direction = Sort.Direction.ASC;
        } else {
            direction = sortDirection.equalsIgnoreCase("DESC")
                    ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
        }

        return PageRequest.of(page, size, Sort.by(direction, sortField));
    }
}

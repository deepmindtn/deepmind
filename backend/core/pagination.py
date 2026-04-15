from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class AppPagination(PageNumberPagination):
    """Reusable app-level pagination with a consistent response payload."""

    page_size = 5
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data, extra=None):
        payload = {
            "count": self.page.paginator.count,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "page": self.page.number,
            "page_size": self.page.paginator.per_page,
            "total_pages": self.page.paginator.num_pages,
            "results": data,
        }
        if extra:
            payload.update(extra)
        return Response(payload)


class FixedPageSizePagination(AppPagination):
    """Default pagination profile used across HR and talent modules."""

    page_size = 5

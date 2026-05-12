import { PaginationMetaDto, PaginationQueryDto } from '../dto/pagination.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export const getPaginationParams = (query?: PaginationQueryDto) => {
  const page = query?.page ?? DEFAULT_PAGE;
  const limit = query?.limit ?? DEFAULT_LIMIT;
  const safePage = Math.max(DEFAULT_PAGE, page);
  const safeLimit = Math.min(Math.max(1, limit), 100);

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number,
): PaginationMetaDto => {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: totalPages > 0 && page < totalPages,
    hasPreviousPage: page > 1,
  };
};

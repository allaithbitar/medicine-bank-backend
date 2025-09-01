export type TJwtAuthTokens = {
  token: string;
  refreshToken: string;
};

export type TPagination = {
  pageSize?: number;
  pageNumber?: number;
};

export type TSystemError = {
  en: string;
  ar: string;
  code: string;
  details?: any;
};

export type TPaginatedResponse<T> = {
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  items: T[];
};

export type TCreatedBy = {
  createdBy: string;
};

export type TUpdatedBy = {
  updatedBy: string;
};

export type Nullable<T> = T | null;
export type Nullish<T> = T | undefined | null;
export type PartiallyNullable<T> = Partial<{
  [K in keyof T]: T[K] | null;
}>;

export type OptionType = {
  label: string;
  value: Nullish<string | number>;
};

export type PaginationResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
};

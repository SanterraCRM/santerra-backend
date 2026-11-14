export const LIST_SORTS = ["name"] as const;

export type ListSort = (typeof LIST_SORTS)[number];

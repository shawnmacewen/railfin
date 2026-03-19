export type DataScope = {
  ownerUserId: string;
};

export function normalizeDataScope(input: DataScope): DataScope {
  return {
    ownerUserId: input.ownerUserId.trim(),
  };
}

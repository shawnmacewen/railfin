export type DataScope = {
  ownerId: string;
  tenantId: string;
};

export function normalizeDataScope(input: DataScope): DataScope {
  return {
    ownerId: input.ownerId.trim(),
    tenantId: input.tenantId.trim(),
  };
}

export function normalizeRole(role: string): string {
  return role.trim().toLowerCase();
}

export function isLojaRole(role: string): boolean {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "loja" || normalizedRole === "funcionario" || normalizedRole === "vendedor";
}

export function isLojaOwnerRole(role: string): boolean {
  return normalizeRole(role) === "loja";
}

export function isFuncionarioRole(role: string): boolean {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "funcionario" || normalizedRole === "vendedor";
}

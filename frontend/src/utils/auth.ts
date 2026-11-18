export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string | null;
}

export function getCurrentUser(): AuthUser | null {
  const user = localStorage.getItem("itflow_user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as AuthUser;
  } catch {
    return null;
  }
}

export function hasRole(role: string): boolean {
  return getCurrentUser()?.role === role;
}

export function hasAnyRole(roles: string[]): boolean {
  const currentRole = getCurrentUser()?.role;

  return currentRole ? roles.includes(currentRole) : false;
}

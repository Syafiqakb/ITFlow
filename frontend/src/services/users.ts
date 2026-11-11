import api from "./api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string | null;
  department: string | null;
}

interface UsersResponse {
  data: User[];
}

export async function getUsers(): Promise<User[]> {
  const response = await api.get<UsersResponse>("/users");

  return response.data.data;
}

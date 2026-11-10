import api from "./api";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string | null;
    department: string | null;
  };
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/login", payload);

  return response.data;
}

export interface User {
  userid: string;
  email: string;
  name: string;
  createdAt: string;
  exists: boolean;
  token: string;
}

export interface UserResponse {
  user: User;
  token: string;
  message: string;
}

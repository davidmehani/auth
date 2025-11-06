export interface User {
  userId: string;
  createdAt: number;
  updatedAt: number;
  email?: string;
  refreshToken?: string;
}

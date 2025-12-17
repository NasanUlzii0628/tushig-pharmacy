export interface UserType {
  id: number;
  username: string;
  role: string;
  password_hash: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateForm {
  username: string;
  password: string;
}

export interface UserUpdateForm {
  id: number;
  username: string;
   password?: string
}

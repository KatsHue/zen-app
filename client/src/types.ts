export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: { field: string; message: string }[];
}

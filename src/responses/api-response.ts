export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const ok = <T>(data: T, message: string): ApiResponse<T> => ({
  status: 'success',
  message,
  data,
});

interface ApiError {
  message: string;
  statusCode: number;
}

export const isApiError = (error: unknown): error is ApiError => {
  return typeof (error as Record<string, string>)?.message === "string";
};

type ApiErrorShape = {
  response?: { data?: { message?: string | string[] } };
};

function isApiErrorShape(error: unknown): error is ApiErrorShape {
  return typeof error === 'object' && error !== null;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isApiErrorShape(error)) {
    return fallback;
  }

  const message = error.response?.data?.message;
  if (Array.isArray(message)) {
    return message.filter(Boolean).join(', ') || fallback;
  }
  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

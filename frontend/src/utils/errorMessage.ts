import axios from "axios";

const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again."
) => {
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_NETWORK" || !error.response) {
      return "Could not reach the server. Please make sure the backend is running and try again.";
    }

    const message = error.response.data?.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    if (error.response.status >= 500) {
      return "The server had a problem. Please try again in a moment.";
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
};

export { getErrorMessage };

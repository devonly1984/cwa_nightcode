import type { ErrorResponse } from "../types";

export const getErrorMessage = async (response: ErrorResponse) => {
  try {
    const data = (await response.json()) as { error?: string };
    if (typeof data.error === "string" && data.error.length > 0) {
      return data.error;
    }
  } catch (error) {}
  return (
    response.statusText || `Request failed with status ${response.status}`
  );
};

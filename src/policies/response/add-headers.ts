import { TResponsePolicyHandler } from "../../types";

type AddHeadersOptions = {
  headers: Record<string, string>;
};

export const addHeaders: TResponsePolicyHandler = (
  response: Response,
  options: AddHeadersOptions
) => {
  for (const [key, value] of Object.entries(options.headers)) {
    response.headers.set(key, value);
  }
};

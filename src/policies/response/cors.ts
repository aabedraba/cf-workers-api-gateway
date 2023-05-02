import { TResponsePolicyHandler } from "../../types";

type CorsOptions = {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge: number;
  allowCredentials: boolean;
};

export const cors: TResponsePolicyHandler = (
  response: Response,
  options: CorsOptions
) => {
  const {
    allowedOrigins,
    allowedMethods,
    allowedHeaders,
    exposedHeaders,
    maxAge,
    allowCredentials,
  } = options;

  if (allowedOrigins.length > 0) {
    response.headers.set(
      "Access-Control-Allow-Origin",
      allowedOrigins.join(", ")
    );
  }

  if (allowedMethods.length > 0) {
    response.headers.set(
      "Access-Control-Allow-Methods",
      allowedMethods.join(", ")
    );
  }

  if (allowedHeaders.length > 0) {
    response.headers.set(
      "Access-Control-Allow-Headers",
      allowedHeaders.join(", ")
    );
  }

  if (exposedHeaders.length > 0) {
    response.headers.set(
      "Access-Control-Expose-Headers",
      exposedHeaders.join(", ")
    );
  }

  if (maxAge) {
    response.headers.set("Access-Control-Max-Age", maxAge.toString());
  }

  if (allowCredentials) {
    response.headers.set(
      "Access-Control-Allow-Credentials",
      `${allowCredentials}`
    );
  }

  return response;
};

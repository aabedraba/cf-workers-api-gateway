import * as jose from "jose";
import { IRequest, TRequestPolicyHandler } from "../../types";
import { ErrorResponse } from "../../helpers/response";

type Auth0JwtOptions = {
  issuer: string;
  audience: string;
};

export const auth0jwt: TRequestPolicyHandler = async (
  request: IRequest,
  options: Auth0JwtOptions
) => {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return new ErrorResponse("Authorization header is missing", 401);
  }

  const [authType, token] = authHeader.split(" ");
  if (authType !== "Bearer") {
    return new ErrorResponse("Authorization header is not bearer token", 401);
  }

  const JWKS = jose.createRemoteJWKSet(
    new URL(`${options.issuer}.well-known/jwks.json`)
  );

  try {
    const verificationResult = await jose.jwtVerify(token, JWKS, {
      issuer: options.issuer,
      audience: options.audience,
    });

    request.user = verificationResult.payload.sub;
    return request;
  } catch (error) {
    // TODO: get rid of console.logs for a better logger
    console.log("error: ", error);
    return new ErrorResponse("JWT verification failed", 401);
  }
};

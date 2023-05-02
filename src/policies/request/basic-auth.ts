import { IRequest, TRequestPolicyHandler } from "../../types";
import { ErrorResponse } from "../../helpers/response";

type basicAuthtOptions = {
  username: string;
  password: string;
};

export const basicAuth: TRequestPolicyHandler = async (
  request: IRequest,
  options: basicAuthtOptions
) => {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return new ErrorResponse("Authorization header is missing", 401);
  }
  
  const [authenticationType, encodedToken] = authHeader.split(" ");
  if (authenticationType !== 'Basic' || authenticationType == undefined || encodedToken === undefined) {
    return new ErrorResponse("Authorization format is incorrect. Correct format: 'Basic {base64({user}:{password})}'", 401);
  }
  
  if (btoa(options.username + ":" + options.password) !== encodedToken) {
    return new ErrorResponse("Incorrect basic authentication", 401);
  }

    return request;
};

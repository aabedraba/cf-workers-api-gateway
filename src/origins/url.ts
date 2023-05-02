import { ErrorResponse } from "../helpers/response";
import { IRequest, TOriginHandler } from "../types";

type UrlOptions = {
  url: string;
};

export const url: TOriginHandler = async (
  request: IRequest,
  options: UrlOptions
) => {
  const originRequest = new Request(options.url, new Request(request));
  try {
    const originFetch = await fetch(originRequest);
    return new Response(originFetch.body, originFetch);
  } catch (err) {
    console.log(err);
    return new ErrorResponse("Origin request failed", 500);
  }
};

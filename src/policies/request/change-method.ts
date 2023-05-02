import { IRequest, IRequestInit, TRequestPolicyHandler } from "../../types";

type ChangeMethodOptions = {
  method: string;
};

export const changeMethod: TRequestPolicyHandler = async (
  request: IRequest,
  options: ChangeMethodOptions
) => {
  const initRequest: IRequestInit = {
    method: options.method,
    headers: new Headers(request.headers),
    body: request.body,
    cf: request.cf,
    fetcher: request.fetcher,
    redirect: request.redirect,
    signal: request.signal,
    user: request.user,
  };

  if (options.method === "GET") {
    initRequest.body = null;
    initRequest.headers.delete("Content-Type");
    initRequest.headers.delete("Content-Length");
  }

  const newRequest = new Request(request.url, initRequest);

  return newRequest;
};

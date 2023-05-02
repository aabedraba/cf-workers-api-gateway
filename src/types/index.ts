export declare interface IRequest extends Request {
  user?: any;
}

export declare interface IRequestInit extends RequestInit {
  user?: any;
  headers: Headers;
}

export type TRequestPolicyHandler = (
  request: IRequest,
  options: any
) => Promise<IRequest | Response>;

export type TResponsePolicyHandler = (response: Response, options: any) => void;

export type TPolicyName = string;

export type TRequestPolicy = {
  handler: TRequestPolicyHandler;
  options: any;
};

export type TResponsePolicy = {
  handler: TResponsePolicyHandler;
  options: any;
};

export type TOriginHandler = (
  request: IRequest,
  options: any
) => Promise<Response>;

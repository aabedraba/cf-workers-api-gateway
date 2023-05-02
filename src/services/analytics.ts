import { Env } from "..";

type LogEvent = {
  path: string;
  method: string;
  partialResponse: string;
  status: number;
  gatewayName: string;
};

export const logAnalytics = async (
  req: Request,
  res: Response,
  env: Env,
  latency: number
): Promise<void> => {
  if (!env.GATEWAY_NAME) {
    console.error("Environment variable for analytics is not set");
    return;
  }

  if (env.ANALYTICS_ENABLED !== "true") {
    console.log("Analytics are not logged in non-production environments");
    return;
  }

  // Log analytics
  const url = new URL(req.url);
  const clonedResponse = res.clone();

  const responseString = await clonedResponse.text();
  const log: LogEvent = {
    path: url.pathname,
    method: req.method,
    partialResponse: responseString.substring(0, 100),
    status: res.status,
    gatewayName: env.GATEWAY_NAME,
  };
};

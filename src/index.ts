import * as requestPolicies from "./policies/request";
import * as responsePolicies from "./policies/response";
import * as gatewayOrigins from "./origins";
import { ErrorResponse } from "./helpers/response";
import {
  TPolicyName,
  TRequestPolicy,
  TResponsePolicy,
  TRequestPolicyHandler,
  TResponsePolicyHandler,
  IRequest,
} from "./types";
import config from "./config.json";
import { logAnalytics } from "./services/analytics";

export interface Env {
  GATEWAY_NAME?: string;
  ANALYTICS_ENABLED?: string;
  [key: string]: any; // for analytics env
}

const requestPoliciesMap = new Map<TPolicyName, TRequestPolicy>();

config.policies.forEach((policy) => {
  requestPoliciesMap.set(policy.name, {
    handler: requestPolicies[policy.type as keyof TRequestPolicyHandler],
    options: policy.options,
  });
});

const responsePoliciesMap = new Map<TPolicyName, TResponsePolicy>();

config.policies.forEach((policy) => {
  responsePoliciesMap.set(policy.name, {
    handler: responsePolicies[policy.type as keyof TResponsePolicyHandler],
    options: policy.options,
  });
});

const routes = config.routes.map((route) => {
  return {
    path: route.path,
    method: route.method,
    origin: {
      handler: gatewayOrigins[route.origin.type as keyof typeof gatewayOrigins],
      options: route.origin.options,
    },
    policies: {
      request: route.policies.request.map((policyName) => {
        const policyHander = requestPoliciesMap.get(policyName);
        if (!policyHander) {
          throw new Error(`Policy ${policyName} not found`);
        }
        return policyHander;
      }),
      response: route.policies.response.map((policyName) => {
        const policyHander = responsePoliciesMap.get(policyName);
        if (!policyHander) {
          throw new Error(`Policy ${policyName} not found`);
        }
        return policyHander;
      }),
    },
  };
});

export default {
  async fetch(originalRequest: IRequest, env: Env, ctx: ExecutionContext) {
    console.log(originalRequest.url, originalRequest.method);
    const latencyStart = Date.now();
    try {
      for (const route of routes) {
        const requestUrl = new URL(originalRequest.url);
        if (
          route.path === requestUrl.pathname &&
          route.method === originalRequest.method
        ) {
          // first we handle request policies
          let modifiedRequest: IRequest = originalRequest;
          for (const policy of route.policies.request) {
            const policyResult = await policy.handler(
              modifiedRequest,
              policy.options
            );

            if (policyResult instanceof Response) {
              const latencyEnd = Date.now();
              ctx.waitUntil(
                logAnalytics(
                  originalRequest,
                  policyResult,
                  env,
                  latencyEnd - latencyStart
                )
              );
              return policyResult;
            }

            modifiedRequest = policyResult;
          }

          // then we handle the origin
          const originResponse = await route.origin.handler(
            modifiedRequest,
            route.origin.options
          );
          // then we handle response policies
          // these policies will modify the response
          for (const policy of route.policies.response) {
            policy.handler(originResponse, policy.options);
          }

          // and finally we return the response
          const latencyEnd = Date.now();
          ctx.waitUntil(
            logAnalytics(
              originalRequest,
              originResponse,
              env,
              latencyEnd - latencyStart
            )
          );
          return originResponse;
        }
      }

      const response = new ErrorResponse("Route not found", 404);
      const latencyEnd = Date.now();
      ctx.waitUntil(
        logAnalytics(originalRequest, response, env, latencyEnd - latencyStart)
      );
      return response;
    } catch (err) {
      console.log(err);
      const response = new ErrorResponse("An error occured.", 500);
      const latencyEnd = Date.now();
      ctx.waitUntil(
        logAnalytics(originalRequest, response, env, latencyEnd - latencyStart)
      );
      return response;
    }
  },
};

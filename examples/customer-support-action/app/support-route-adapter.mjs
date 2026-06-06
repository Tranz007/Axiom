import { handleAxiomRoute } from "../generated/route-skeleton.mjs";
import { validateIntegrationHooks } from "../generated/integration-contracts.mjs";

export function createSupportRouteAdapter(hooks) {
  const integration = validateIntegrationHooks("issue_refund_credit", hooks);
  if (!integration.ok) {
    throw new Error(`Missing Axiom integration hook(s): ${integration.missing.join(", ")}`);
  }

  return async function supportRefundRoute(request) {
    const body = request.body || {};
    const result = await handleAxiomRoute(
      "issue_refund_credit",
      {
        facts: body.facts || {},
        approval: body.approval || {},
        auditPayload: body.auditPayload || {},
        input: body.input || {},
      },
      hooks,
    );

    return {
      statusCode: result.status,
      headers: { "content-type": "application/json" },
      body: result.body,
    };
  };
}

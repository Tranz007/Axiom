import { createApprovalReviewModel, assertApprovalReviewComplete } from "../generated/approval-ui.mjs";
import { validateIntegrationHooks } from "../generated/integration-contracts.mjs";
import { handleAxiomRoute } from "../generated/route-skeleton.mjs";

const refundRequest = {
  request_hash: "refund:req_1001",
  customer_id: "cus_123",
  ticket_id: "ticket_456",
  support_agent_id: "agent_789",
  refund_amount: "42.00",
  refund_reason: "duplicate charge",
  destination_identity: "card_token_abc",
  expiry: "2026-06-30T00:00:00Z",
};

function approvedRefundRequest() {
  return {
    facts: {
      approval_valid: true,
      refund_amount_within_policy: true,
      destination_matches_approval: true,
      customer_matches_ticket: true,
    },
    approval: {
      ...refundRequest,
      capability_key: "issue_refund_credit",
      valid: true,
    },
    auditPayload: {
      ticket_id: refundRequest.ticket_id,
      customer_id: refundRequest.customer_id,
      refund_amount_bucket: "under_50",
      approval_state: "approved",
    },
  };
}

function statusSummary(result) {
  return {
    status: result.status,
    bodyStatus: result.body?.status,
  };
}

export async function runSupportRefundMiniApp(options = {}) {
  const state = {
    brokerCalls: 0,
    approvalsStored: [],
    auditEvents: [],
    auditReservations: [],
  };

  const hooks = {
    authorize: async ({ capability }) => capability === "issue_refund_credit" && options.authorized !== false,
    reserveAudit: async (reservation) => {
      if (options.failAuditReservation) {
        throw new Error("audit_unavailable");
      }
      state.auditReservations.push(reservation);
    },
    storeApprovalDecision: async (approval) => {
      if (options.failApprovalPersistence) {
        throw new Error("approval_persistence_failed");
      }
      state.approvalsStored.push(approval);
    },
    executeBroker: async () => {
      state.brokerCalls += 1;
      options.onBroker?.();
      return {
        tokenized_reference: "refund_token_123",
        disclosureMode: "tokenized_reference",
      };
    },
    writeAudit: async (event) => {
      if (options.failAuditWrite) {
        throw new Error("audit_write_failed");
      }
      state.auditEvents.push(event);
    },
  };

  const integration = validateIntegrationHooks("issue_refund_credit", hooks);
  if (!integration.ok) {
    throw new Error(`Missing Axiom integration hook(s): ${integration.missing.join(", ")}`);
  }

  const approvalRequired = await handleAxiomRoute(
    "issue_refund_credit",
    {
      facts: { refund_requested: true },
      input: refundRequest,
    },
    hooks,
  );
  const brokerCallsBeforeApproval = state.brokerCalls;
  if (approvalRequired.status !== 409) {
    return {
      approvalRequired: statusSummary(approvalRequired),
      brokerCalls: state.brokerCalls,
      approvalsStored: state.approvalsStored.length,
      auditReservations: state.auditReservations.length,
      auditEvents: state.auditEvents.length,
    };
  }

  const review = createApprovalReviewModel("issue_refund_credit", {
    input: refundRequest,
    approval: refundRequest,
  });
  assertApprovalReviewComplete(review);
  await hooks.storeApprovalDecision({
    capability: "issue_refund_credit",
    fields: review.fields,
    valid: true,
  });

  await hooks.reserveAudit({
    capability: "issue_refund_credit",
    request_hash: refundRequest.request_hash,
    mode: "fail_closed_before_broker",
  });

  const approved = await handleAxiomRoute("issue_refund_credit", approvedRefundRequest(), hooks);

  const denied = await handleAxiomRoute(
    "issue_refund_credit",
    { facts: { destination_mismatch: true } },
    hooks,
  );

  return {
    approvalRequired: {
      ...statusSummary(approvalRequired),
      brokerCallsBeforeApproval,
    },
    review: {
      ok: review.ok,
      fields: review.fields.map((field) => field.name),
      missing: review.missing,
    },
    approved: {
      ...statusSummary(approved),
      brokerResponse: approved.body.brokerResponse,
    },
    denied: statusSummary(denied),
    brokerCalls: state.brokerCalls,
    approvalsStored: state.approvalsStored.length,
    auditReservations: state.auditReservations.length,
    auditEvents: state.auditEvents.length,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(await runSupportRefundMiniApp(), null, 2));
}

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runSupportRefundMiniApp } from "./support-mini-app.mjs";
import { createSupportRouteAdapter } from "./support-route-adapter.mjs";

describe("customer support mini app", () => {
  it("runs approval review before executing the refund broker", async () => {
    const result = await runSupportRefundMiniApp();

    assert.equal(result.approvalRequired.status, 409);
    assert.equal(result.approvalRequired.bodyStatus, "approval_required");
    assert.equal(result.approvalRequired.brokerCallsBeforeApproval, 0);
    assert.deepEqual(result.review.missing, []);
    assert.deepEqual(result.review.fields, [
      "request_hash",
      "customer_id",
      "ticket_id",
      "support_agent_id",
      "refund_amount",
      "destination_identity",
      "expiry",
    ]);
    assert.equal(result.approved.status, 200);
    assert.equal(result.approved.bodyStatus, "ok");
    assert.equal(result.approved.brokerResponse.tokenized_reference, "refund_token_123");
    assert.equal(result.denied.status, 403);
    assert.equal(result.denied.bodyStatus, "denied");
    assert.equal(result.brokerCalls, 1);
    assert.equal(result.approvalsStored, 1);
    assert.equal(result.auditReservations, 1);
    assert.equal(result.auditEvents, 1);
  });

  it("stops unauthorized requests before broker execution", async () => {
    const result = await runSupportRefundMiniApp({ authorized: false });

    assert.equal(result.approvalRequired.status, 401);
    assert.equal(result.approvalRequired.bodyStatus, "unauthorized");
    assert.equal(result.brokerCalls, 0);
    assert.equal(result.approvalsStored, 0);
    assert.equal(result.auditEvents, 0);
  });

  it("fails closed when approval persistence fails", async () => {
    let brokerCalls = 0;

    await assert.rejects(
      () => runSupportRefundMiniApp({ failApprovalPersistence: true, onBroker: () => (brokerCalls += 1) }),
      /approval_persistence_failed/,
    );
    assert.equal(brokerCalls, 0);
  });

  it("fails closed when audit cannot be reserved before broker execution", async () => {
    let brokerCalls = 0;

    await assert.rejects(
      () => runSupportRefundMiniApp({ failAuditReservation: true, onBroker: () => (brokerCalls += 1) }),
      /audit_unavailable/,
    );
    assert.equal(brokerCalls, 0);
  });

  it("adapts generated route results to an HTTP-shaped response", async () => {
    let brokerCalls = 0;
    const route = createSupportRouteAdapter({
      authorize: async () => true,
      executeBroker: async () => {
        brokerCalls += 1;
        return { tokenized_reference: "refund_token_456", disclosureMode: "tokenized_reference" };
      },
      writeAudit: async () => {},
      storeApprovalDecision: async () => {},
    });

    const response = await route({
      body: {
        facts: { refund_requested: true },
        input: { ticket_id: "ticket_456" },
      },
    });

    assert.equal(response.statusCode, 409);
    assert.equal(response.headers["content-type"], "application/json");
    assert.equal(response.body.status, "approval_required");
    assert.equal(brokerCalls, 0);
  });
});

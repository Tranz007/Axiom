import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runSupportRefundMiniApp } from "./support-mini-app.mjs";

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
    assert.equal(result.auditEvents, 1);
  });
});

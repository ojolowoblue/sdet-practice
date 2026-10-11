import { afterEach, expect, vi, describe, it } from "vitest";
import { AuditLogger } from "./auditLogger";

describe("Spying on AuditLogger function with vi.spyOn()", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("intercepts stdout and asserts payload structure", () => {
    const stdoutSpy = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);

    AuditLogger.logEvent("USER_LOGIN", { userId: "usr_42" });

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    expect(stdoutSpy).toHaveBeenCalledWith(
      'AUDIT: USER_LOGIN - {"userId":"usr_42"}\n',
    );
  });
});

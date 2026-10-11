export const AuditLogger = {
  logEvent(action: string, metadata: Record<string, unknown>): void {
    // In production, this emits to an observability pipeline (e.g., Datadog)
    process.stdout.write(`AUDIT: ${action} - ${JSON.stringify(metadata)}\n`);
  },
};

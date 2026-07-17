import { prisma } from "@/lib/prisma";

export class AuditLogger {
  static async log(data: {
    profileId: string;
    action: string;
    prompt: string;
    model: string;
    response: string;
    latencyMs: number;
    tokensUsed?: number;
  }) {
    try {
      await prisma.aIAuditLog.create({
        data: {
          profileId: data.profileId,
          action: data.action,
          prompt: data.prompt,
          model: data.model,
          response: data.response,
          latencyMs: data.latencyMs,
          tokensUsed: data.tokensUsed,
        },
      });
    } catch (error) {
      console.error("Failed to write to AIAuditLog:", error);
    }
  }
}

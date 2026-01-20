import { z } from "zod";

export const FxTxStatus = z.enum([
  "INITIATED",
  "APPROVED",
  "CONFIRMED",
  "APPROVE_FAILED",
  "SWAP_FAILED",
]);

export const createFxTxSchema = z.object({
  walletAddress: z.string().trim().min(1, "Wallet address is required"),
  chain: z.string().trim().min(1, "Chain is required"),
  approveHash: z.string().trim().min(1).optional(),
  swapHash: z.string().trim().min(1).optional(),
  fromToken: z.string().trim().min(1, "From token is required"), // symbol (USDV, NGNV, BRLV, etc.)
  toToken: z.string().trim().min(1, "To token is required"), // symbol (USDV, NGNV, BRLV, etc.)
  fromAmount: z.coerce.number().min(1, "From amount is required"),
  // toAmount: z.coerce.number().min(1, "To amount is required"),
  status: z.enum(FxTxStatus.options).default(FxTxStatus.options[0]),
  // Optional to allow DB to auto-generate when omitted
  timestamp: z.string().datetime().optional(), // ISO timestamp (from block)
});

export type CreateFxTxInput = z.infer<typeof createFxTxSchema>;

export const getFxTxsParamsSchema = z.object({
  walletAddress: z.string().trim().min(1, "Wallet address is required"),
});

export const getFxTxsQuerySchema = z
  .object({
    // Accept ?status=CONFIRMED or ?status=CONFIRMED&status=FAILED or ?status=CONFIRMED,FAILED
    status: z
      .union([z.array(FxTxStatus), FxTxStatus])
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        return Array.isArray(val) ? val : [val];
      }),
  })
  .strict();

// Params for routes using an FX transaction id
export const updateFxTxParamsSchema = z.object({
  id: z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{24}$/, "FxTx id must be a valid MongoDB ObjectId"),
});

// Body schema to update the status and hashes
export const updateFxTxStatusSchema = z.object({
  status: FxTxStatus,
  approveHash: z.string().optional(),
  swapHash: z.string().optional(),
});

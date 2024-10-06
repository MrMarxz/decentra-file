/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import { PinataSDK } from "pinata";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { env } from "@/env";
import { base64ToFile } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { ProcessingStatus } from "@prisma/client";
import { db } from "@/server/db";

export const fileRouter = createTRPCRouter({

  create: publicProcedure
    .input(z.object({
      name: z.string(),
      fileName: z.string(),
      type: z.string(),
      size: z.number(),
      data: z.string(),
      tags: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {

      //#region Session checks. Will change later
      const session = ctx.session;
      const accountAddress = session?.payload.sub;
      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      if (!accountAddress) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      //#endregion

      //#region Upload to IPFS using Pinata
      const pinata = new PinataSDK({
        pinataJwt: env.IPFS_JWT,
        pinataGateway: env.IPFS_DOMAIN,
      });
      const file = base64ToFile(input.data, input.name, input.type);
      const upload = await pinata.upload.file(file);
      //#endregion

      //#region Save to database
      const account = await db.accounts.findFirst({
        where: {
          address: accountAddress
        }
      });

      if (!account) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account not found",
        });
      }
      const fileRecord = await db.files.create({
        data: {
          name: input.name,
          fileName: input.fileName,
          cid: upload.cid,
          type: input.type,
          tags: input.tags,
          uploadedBy: account.id
        }
      })
      //#endregion

      return upload.cid;
    }),
  postTransaction: publicProcedure
    .input(z.object({
      cid: z.string(),
      txHash: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      //#region Session checks. Will change later
      const session = ctx.session;
      const accountAddress = session?.payload.sub;
      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      if (!accountAddress) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      //#endregion

      // Find the corresponding file
      const existingFile = await db.files.findFirst({
        where: {
          cid: input.cid,
          account: {
            address: accountAddress
          }
        }
      });

      if (!existingFile) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File not found. Please upload the file first.",
        });
      }

      if (existingFile.txHash) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Transaction already exists for this file.",
        });
      }

      if (existingFile.status === ProcessingStatus.TRANSACTION_COMPLETE) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Transaction already completed for this file.",
        });
      }

      // Update the file record
      const updatedFile = await db.files.update({
        where: {
          id: existingFile.id
        },
        data: {
          txHash: input.txHash,
          status: ProcessingStatus.TRANSACTION_COMPLETE
        }
      });

      return "Transaction posted successfully";
    }),
});

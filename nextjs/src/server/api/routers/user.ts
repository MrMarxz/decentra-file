/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";

export const userRouter = createTRPCRouter({

    updateProfile: protectedProcedure
    .input(z.object({
        username: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
        const accountAddress = ctx.session.walletAddress

        const account = await db.accounts.findFirst({
            where: {
                address: accountAddress
            }
        });

        if (!account) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Account not found. Please make sure you are logged in.",
            });
        }

        const updatedAccount = await db.accounts.update({
            where: {
                id: account.id
            },
            data: {
                username: input.username
            }
        })

        return updatedAccount;
    }),

    getProfile: protectedProcedure
    .query(async ({ ctx }) => {
        const accountAddress = ctx.session.walletAddress

        const account = await db.accounts.findFirst({
            where: {
                address: accountAddress
            }
        });

        if (!account) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Account not found. Please make sure you are logged in.",
            });
        }

        return account;
    }),
});

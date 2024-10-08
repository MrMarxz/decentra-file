/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import { PinataSDK } from "pinata";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { env } from "@/env";
import { base64ToFile } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { ProcessingStatus } from "@prisma/client";
import { db } from "@/server/db";

export const fileRouter = createTRPCRouter({

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      fileName: z.string(),
      type: z.string(),
      size: z.number(),
      data: z.string(),
      tags: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      const accountAddress = ctx.session.walletAddress

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
  postTransaction: protectedProcedure
    .input(z.object({
      cid: z.string(),
      txHash: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const accountAddress = ctx.session.walletAddress

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
  like: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const accountAddress = ctx.session.walletAddress

      // Find the corresponding file
      const existingFile = await db.files.findFirst({
        where: {
          id: input.id
        }
      });

      if (!existingFile) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File not found. Please upload the file first.",
        });
      }

      // Check if the user previously disliked the file
      const account = await db.accounts.findFirst({
        where: {
          address: accountAddress
        },
        include: {
          dislikedFiles: true
        }
      });

      if (!account) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account not found",
        });
      }

      let hasDisliked = false;

      if (account.dislikedFiles.some((dislikedFile) => dislikedFile.id === existingFile.id)) {
        hasDisliked = true;
      }

      // Update the file record
      const updatedFile = await db.files.update({
        where: {
          id: existingFile.id
        },
        data: {
          likes: existingFile.likes + 1,
          ...(hasDisliked && { dislikes: existingFile.dislikes - 1 })
        }
      });

      // Update the account's liked files
      const update = await db.accounts.update({
        where: {
          address: accountAddress
        },
        data: {
          likedFiles: {
            connect: {
              id: existingFile.id
            }
          },
          ...(hasDisliked && {
            dislikedFiles: {
              disconnect: {
                id: existingFile.id
              }
            }
          })
        }
      })

      return "File liked successfully";
    }),

  dislike: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const accountAddress = ctx.session.walletAddress


      // Find the corresponding file
      const existingFile = await db.files.findFirst({
        where: {
          id: input.id
        }
      });

      if (!existingFile) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File not found. Please upload the file first.",
        });
      }

      // Check if the user previously liked the file
      const account = await db.accounts.findFirst({
        where: {
          address: accountAddress
        },
        include: {
          likedFiles: true
        }
      });

      if (!account) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account not found",
        });
      }

      let hasLiked = false;

      if (account.likedFiles.some((likedFile) => likedFile.id === existingFile.id)) {
        hasLiked = true;
      }

      // Update the file record
      const updatedFile = await db.files.update({
        where: {
          id: existingFile.id
        },
        data: {
          dislikes: existingFile.dislikes + 1,
          ...(hasLiked && { likes: existingFile.likes - 1 })
        }
      });

      // Update the account's disliked files
      const update = await db.accounts.update({
        where: {
          address: accountAddress
        },
        data: {
          dislikedFiles: {
            connect: {
              id: existingFile.id
            }
          },
          ...(hasLiked && {
            likedFiles: {
              disconnect: {
                id: existingFile.id
              }
            }
          })
        }
      })


      return "File disliked successfully";
    }),

  // Get commuinty files with likes and dislikes
  getCommunityFiles: publicProcedure
    .query(async ({ ctx }) => {

      /*
        Return objects: [
            {
                hasLiked: true,
                hasDisliked: false,
                file: {}
            }
        ]
      */
      const accountAddress = ctx?.session?.payload.sub;
      const files = await db.files.findMany({
        where: {
          status: ProcessingStatus.TRANSACTION_COMPLETE,
          txHash: {
            not: null,
          }
        }
      });

      if (!accountAddress) {
        // Create return object
        return files.map((file) => ({
          hasLiked: false,
          hasDisliked: false,
          file
        }));
      } else {
        const account = await db.accounts.findFirst({
          where: {
            address: accountAddress
          },
          include: {
            likedFiles: true,
            dislikedFiles: true
          }
        });

        if (!account) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Account not found",
          });
        }

        // Create return object
        return files.map((file) => ({
          hasLiked: account.likedFiles.some((likedFile) => likedFile.id === file.id),
          hasDisliked: account.dislikedFiles.some((dislikedFile) => dislikedFile.id === file.id),
          file
        }));
      }


    }),
});

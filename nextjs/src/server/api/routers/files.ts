import { z } from "zod";
import { PinataSDK } from "pinata";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { env } from "@/env";
import { base64ToFile } from "@/lib/utils";

export const fileRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string(),
      type: z.string(),
      size: z.number(),
      data: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const pinata = new PinataSDK({
        pinataJwt: env.IPFS_JWT,
        pinataGateway: env.IPFS_DOMAIN,
      });

      const file = base64ToFile(input.data, input.name, input.type);

      const upload = await pinata.upload.file(file);

      console.log("Upload: ", upload);
    }),
});

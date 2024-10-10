/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use server";
import { type VerifyLoginPayloadParams, createAuth } from "thirdweb/auth";
import { client } from "@/lib/client";
import { cookies } from "next/headers";
import { env } from "@/env";
import { generateAccount } from "thirdweb/wallets";
import { db } from "@/server/db";
import { generateUsername } from "@/lib/utils";

const adminAccount = await generateAccount({ client });

const thirdwebAuth = createAuth({
  domain: env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
  client: client,
  adminAccount
});

export const generatePayload = thirdwebAuth.generatePayload;

export async function login(payload: VerifyLoginPayloadParams) {
  const verifiedPayload = await thirdwebAuth.verifyPayload(payload);
  if (verifiedPayload.valid) {
    const jwt = await thirdwebAuth.generateJWT({
      payload: verifiedPayload.payload,
      context: { adminAccount }
    });
    cookies().set("jwt", jwt);

    // Check if the account is in the database
    const address = payload.payload.address;

    const existingAccount = await db.accounts.findFirst({
      where: {
        address
      }
    });

    // If the account is not in the database, add it
    if (!existingAccount) {
      const username = generateUsername();
      await db.accounts.create({
        data: {
          address,
          username
        }
      });
    }
  }
  else {
    // Remove the JWT cookie if the payload is not valid
    cookies().delete("jwt");
  }
}

export async function isLoggedIn() {
  const jwt = cookies().get("jwt");
  if (!jwt?.value) {
    return false;
  }

  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value });
  if (!authResult.valid) {
    return false;
  }
  return true;
}

export async function logout() {
  cookies().delete("jwt");
}

"use server";
import { type VerifyLoginPayloadParams, createAuth } from "thirdweb/auth";
import { client } from "@/lib/client";
import { cookies } from "next/headers";
import { env } from "@/env";
import { generateAccount } from "thirdweb/wallets";

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
    });
    cookies().set("jwt", jwt);
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

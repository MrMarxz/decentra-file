// lib/client.ts
import { env } from "@/env";
import { createThirdwebClient } from "thirdweb";

const clientId = env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID; // this will be used on the client
const secretKey = env.THIRDWEB_SECRET_KEY; // this will be used on the server-side

export const client = createThirdwebClient(
  secretKey ? { secretKey } : { clientId },
);

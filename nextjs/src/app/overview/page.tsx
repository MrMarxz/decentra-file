"use client";

import { ConnectButton } from "thirdweb/react";
import { generatePayload, isLoggedIn, login, logout } from "@/actions/login";
import { createWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";
import { env } from "@/env";

const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
];

const client = createThirdwebClient({ clientId: env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID });

export default function Overview() {

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
                <ConnectButton
                    wallets={wallets}
                    chains={[polygon]}
                    client={client}
                    auth={{
                        isLoggedIn: async (address) => {
                            console.log("checking if logged in!", { address });
                            return await isLoggedIn();
                        },
                        doLogin: async (params) => {
                            console.log("logging in!");
                            await login(params);
                        },
                        getLoginPayload: async ({ address }) =>
                            generatePayload({ address }),
                        doLogout: async () => {
                            console.log("logging out!");
                            await logout();
                        },
                    }}
                />
            </div>
        </main>
    );
}

"use client";

import React from 'react';
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { polygon, localhost } from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";
import { generatePayload, isLoggedIn, login, logout } from "@/actions/login";
import { env } from '@/env';
import useWallet from '@/store/useWallet';

const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
];

const client = createThirdwebClient({ clientId: env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID });

const Navbar = () => {
    const walletStore = useWallet();
    return (

        <nav className="bg-blue-950 shadow-md">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <span className="text-2xl font-bold text-white pl-2 sm:pl-4">Decentra File</span>
                    </div>
                    <div className="flex items-center">
                        <div className="pr-2 sm:pr-4">
                            <ConnectButton
                                wallets={wallets}
                                chains={[localhost]}
                                client={client}
                                connectButton={{
                                    className: "!w-32 !h-10 !px-4 !py-2 !text-sm !font-medium !rounded-md !bg-[#007F7F] !text-white !hover:bg-[#007F7F] !focus:outline-none !focus:ring-2 !focus:ring-offset-2 !focus:ring-[#007F7F]",
                                    label: "Connect Wallet",
                                }}
                                auth={{
                                    isLoggedIn: async (address) => {
                                        console.log("checking if logged in!", { address });
                                        const isConnected = await isLoggedIn();
                                        walletStore.setIsWalletConnected(isConnected);
                                        return isConnected;
                                    },
                                    doLogin: async (params) => {
                                        console.log("logging in!", params);
                                        await login(params);
                                    },
                                    getLoginPayload: async ({ address }) =>
                                        generatePayload({ address }),
                                    doLogout: async () => {
                                        console.log("logging out!");
                                        await logout();
                                        walletStore.checkLogin();
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
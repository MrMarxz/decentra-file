"use client";

import UploadFileDialog from "../../components/custom/upload-dialog";
import { type ReactNode, useEffect, useState } from "react";
import { isLoggedIn } from "@/actions/login";
import useWallet from "@/store/useWallet";

interface AuthLayoutProps {
    children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    const walletStore = useWallet();

    return (
        <>
            {walletStore.isWalletConnected && <UploadFileDialog />}
            {children}
        </>
    )
};

export default AuthLayout;
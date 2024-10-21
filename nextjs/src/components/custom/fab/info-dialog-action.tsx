"use client";

import React, { useEffect, useState } from 'react';
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InfoDialog() {
    const [open, setOpen] = useState(false);

    const faucets = [
        { name: "Coinbase Developer Platform", url: "https://portal.cdp.coinbase.com/products/faucet" },
        { name: "thirdweb Faucet", url: "https://thirdweb.com/base-sepolia-testnet" },
        { name: "Superchain Faucet", url: "https://app.optimism.io/faucet" },
        { name: "Alchemy Faucet", url: "https://basefaucet.com/" },
        { name: "Bware Labs Faucet", url: "https://bwarelabs.com/faucets" },
        { name: "QuickNode Faucet", url: "https://faucet.quicknode.com/drip" },
        { name: "LearnWeb3 Faucet", url: "https://learnweb3.io/faucets/base_sepolia" },
        { name: "Ethereum Ecosystem Faucet", url: "https://www.ethereum-ecosystem.com/faucets/base-sepolia" },
    ]

    useEffect(() => {
        // Check if the user has seen the dialog before
        const hasSeenDialog = localStorage.getItem('hasSeenInfoDialog');

        if (!hasSeenDialog) {
            setOpen(true);
            localStorage.setItem('hasSeenInfoDialog', 'true');
        }
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="w-10 h-10 rounded-full shadow-lg transition-all duration-300 ease-in-out bg-primary text-white hover:text-white bg-[#007F7F] hover:bg-[#007F7F] hover:scale-110"
                >
                    <Info className="h-5 w-5" />
                    <span className="sr-only">Info</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-w-[90vw] bg-gradient-to-br from-teal-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 border-0 shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center text-teal-700 dark:text-teal-300 mb-4">Information</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="general">General Info</TabsTrigger>
                        <TabsTrigger value="faucets">Testnet Faucets</TabsTrigger>
                    </TabsList>
                    <TabsContent value="general" className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        <h3 className="text-lg font-semibold mb-2">Welcome to DecentraFile!</h3>
                        <p className="mb-2">
                            {"DecentraFile is a decentralized platform for sharing interesting resources. Here's how it works:"}
                        </p>
                        <ul className="list-disc pl-5 mb-2">
                            <li>Upload your files to IPFS (InterPlanetary File System)</li>
                            <li>File details are stored on the Base Sepolia testnet</li>
                            <li>Share and discover valuable resources with the community</li>
                        </ul>
                        <p>
                            By leveraging blockchain technology and decentralized storage, we ensure your shared resources remain accessible and tamper-proof.
                        </p>

                        {/* Note p */}
                        <p className="mt-4">
                            <strong>Note:</strong> {"If there are troubles with trying to re-connect your wallet, please clear the cache by clicking the 'Clear Cache' button at the bottom right of the screen."}
                        </p>
                    </TabsContent>
                    <TabsContent value="faucets" className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        <h3 className="text-lg font-semibold mb-2">Testnet Faucets</h3>
                        <p className="mb-2">
                            {"To interact with the Base Sepolia testnet, you'll need some test tokens. Here are some faucets you can use:"}
                        </p>
                        <ul className="list-disc pl-5">
                            {faucets.map((faucet, index) => (
                                <li key={index}>
                                    <a href={faucet.url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{faucet.name}</a>
                                </li>
                            ))}
                        </ul>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
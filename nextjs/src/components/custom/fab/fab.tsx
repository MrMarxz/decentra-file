"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, MessageSquare, HelpCircle, FileText } from 'lucide-react';
import UploadFileDialog from '../upload-dialog';
import ProfileFABAction from './profile-fab-action';
import useWallet from '@/store/useWallet';
import InfoDialog from './info-dialog-action';
import ClearCacheButton from './clear-cache-action';

const FAB = () => {
    const walletStore = useWallet();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <TooltipProvider>
            <div className="fixed bottom-6 right-6 flex flex-col items-center">
                {/* CONTENT */}
                <div className={`flex flex-col gap-3 mb-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    <InfoDialog />
                    {walletStore.isWalletConnected && (
                        <>
                            <ProfileFABAction />
                            <UploadFileDialog />
                        </>
                    )}
                    <ClearCacheButton />
                </div>

                {/* TRIGGER BUTTON */}
                <Button
                    variant="default"
                    size="icon"
                    className="w-14 h-14 rounded-full shadow-lg bg-blue-900 hover:bg-blue-800"
                    onClick={toggleMenu}
                >
                    <Plus className={`h-6 w-6 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </div>
        </TooltipProvider>
    );
};

export default FAB;

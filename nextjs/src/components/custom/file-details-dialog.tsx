"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Calendar, User, Hash, FileType, Copy, HelpCircle, RotateCw } from "lucide-react";
import { type Files } from '@prisma/client';
import Image from 'next/image';
import dayjs from 'dayjs';
import { formatTransactionHash } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { env } from '@/env';

interface FileDetailsDialogProps {
    file: Files;
    accountUsername: string | null;
    like: {
        hasLiked: boolean;
        likedAmount: number;
        handleLike: () => void;
        isLoading: boolean;
    }
    dislike: {
        hasDisliked: boolean;
        dislikedAmount: number;
        handleDislike: () => void;
        isLoading: boolean;
    }
}

const FileDetailsDialog = ({ file, accountUsername, like, dislike }: FileDetailsDialogProps) => {
    const [likes, setLikes] = useState(like.likedAmount);
    const [dislikes, setDislikes] = useState(dislike.dislikedAmount);
    const [hasLiked, setHasLiked] = useState(like.hasLiked);
    const [hasDisliked, setHasDisliked] = useState(dislike.hasDisliked);
    const [isLikeLoading, setIsLikeLoading] = useState(like.isLoading);
    const [isDislikeLoading, setIsDislikeLoading] = useState(dislike.isLoading);

    const ipfsUrl = `https://${env.NEXT_PUBLIC_IPFS_DOMAIN}/ipfs/${file.cid}`;
    const transactionUrl = `https://base-sepolia.blockscout.com/tx/${file.txHash}`;
    const {
        name,
        fileName,
        cid,
        type,
        tags,
        uploadedBy,
        txHash,
        status,
        createdAt
    } = file;

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Copied to clipboard');
        }
        catch (error) {
            toast.error('Failed to copy to clipboard');
        }
    }

    useEffect(() => {
        setLikes(like.likedAmount);
        setDislikes(dislike.dislikedAmount);
        setHasLiked(like.hasLiked);
        setHasDisliked(dislike.hasDisliked);
        setIsLikeLoading(like.isLoading);
        setIsDislikeLoading(dislike.isLoading);
    }, [like.likedAmount, dislike.dislikedAmount, like.hasLiked, dislike.hasDisliked, like.isLoading, dislike.isLoading]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Details
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[400px] sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px]">
                <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-bold truncate">{name}</DialogTitle>
                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                        {tags ? tags.map((tag) => (
                            <Badge key={tag} variant="default" className="bg-blue-950 hover:bg-blue-950 text-xs sm:text-sm">
                                {tag}
                            </Badge>
                        )) : (
                            <Badge variant="default" className="text-xs sm:text-sm">No tags</Badge>
                        )}
                    </div>
                </DialogHeader>
                <Card className="w-full mt-4">
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            <div className="flex flex-col gap-y-3 sm:gap-y-4 justify-between">
                                <div className="flex flex-col gap-y-3 sm:gap-y-4 justify-between">
                                    <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                        <span className="text-sm sm:text-base">Uploaded by: {accountUsername ? accountUsername : "Unknown User"}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FileType className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                        <span className="text-sm sm:text-base">{type}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                        <span className="text-sm sm:text-base">Created: {dayjs(createdAt).format('MMM D, YYYY')}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-y-2 justify-between">
                                    {txHash && (
                                        <div className="flex items-center space-x-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link href={transactionUrl} className="flex flex-row gap-x-2 hover:text-[#007F7F] text-sm sm:text-base" target="_blank">
                                                            <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                                            <span className="truncate">Transaction Hash: {formatTransactionHash(txHash)}</span>
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-xs text-xs sm:text-sm">
                                                            {"A transaction hash is a unique identifier for a blockchain transaction. It's like a receipt number that you can use to look up the details of the transaction."}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => copyToClipboard(txHash)}
                                                className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                                            >
                                                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                                <span className="sr-only">Copy</span>
                                            </Button>
                                        </div>
                                    )}
                                    <div className="flex items-center space-x-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link href="#" className="flex flex-row gap-x-2 hover:text-[#007F7F] text-sm sm:text-base">
                                                        <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                                        <span className="truncate">CID: {formatTransactionHash(cid)}</span>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs text-xs sm:text-sm">
                                                        {"The Content Identifier (CID) is a unique, content-based label used to point to data stored in IPFS (InterPlanetary File System). It's like a fingerprint for your data in the decentralized web."}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => copyToClipboard(cid)}
                                            className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                                        >
                                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span className="sr-only">Copy</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-gray-100 rounded-lg overflow-hidden">
                                {type.startsWith('image/') ? (
                                    <img src={ipfsUrl} alt={name} className="w-full h-full object-contain" />
                                ) : type === 'application/pdf' ? (
                                    <iframe src={ipfsUrl} title={name} className="w-full h-full" />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-sm sm:text-base">Preview not available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-between p-4 sm:p-6">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <Button
                                variant="likeButton"
                                size="sm"
                                disabled={isLikeLoading || hasLiked}
                                onClick={like.handleLike}
                                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                            >
                                {isLikeLoading ? (
                                    <RotateCw className="animate-spin w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                ) : (
                                    <>
                                        <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                        {likes}
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="dislikeButton"
                                size="sm"
                                disabled={isDislikeLoading || hasDisliked}
                                onClick={dislike.handleDislike}
                                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                            >
                                {isDislikeLoading ? (
                                    <RotateCw className="animate-spin w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                ) : (
                                    <>
                                        <ThumbsDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                        {dislikes}
                                    </>
                                )}
                            </Button>
                        </div>
                        <Button 
                            onClick={() => window.open(ipfsUrl, '_blank')} 
                            className="bg-[#007F7F] hover:bg-[#006666] text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                        >
                            View on IPFS
                        </Button>
                    </CardFooter>
                </Card>
            </DialogContent>
        </Dialog>
    );
};

export default FileDetailsDialog;
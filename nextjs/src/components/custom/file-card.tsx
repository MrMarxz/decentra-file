"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, FileText, Calendar, SquareArrowOutUpRight, RotateCw } from 'lucide-react';
import { type Files } from '@prisma/client';
import dayjs from 'dayjs';
import { formatTransactionHash } from '@/lib/utils';
import FileDetailsDialog from './file-details-dialog';
import { api } from '@/trpc/react';
import toast from 'react-hot-toast';

const FileCard = ({ 
    file, 
    hasPreviouslyLiked, 
    hasPreviouslyDisliked,
    accountUsername
}: { 
    file: Files, 
    hasPreviouslyLiked: boolean, 
    hasPreviouslyDisliked: boolean,
    accountUsername: string | null
}) => {
    const utils = api.useUtils();

    const transactionUrl = `https://base-sepolia.blockscout.com/tx/${file.txHash}`;

    const [hasLiked, setHasLiked] = useState(false);
    const [hasDisliked, setHasDisliked] = useState(false);
    const [likedAmount, setLikedAmount] = useState(file.likes);
    const [dislikedAmount, setDislikedAmount] = useState(file.dislikes);
    const likeFile = api.files.like.useMutation({
        onSuccess: () => {
            toast.success('Liked file');
            setHasLiked(true);
            setLikedAmount(likedAmount + 1);
            if (hasDisliked) {
                setHasDisliked(false);
                setDislikedAmount(dislikedAmount - 1);
            }
        },
        onSettled: () => {
            void utils.files.getCommunityFiles.invalidate();
        }
    });
    const dislikeFile = api.files.dislike.useMutation({
        onSuccess: () => {
            toast.success('Disliked file');
            setHasDisliked(true);
            setDislikedAmount(dislikedAmount + 1);
            if (hasLiked) {
                setHasLiked(false);
                setLikedAmount(likedAmount - 1);
            }
        },
        onSettled: () => {
            void utils.files.getCommunityFiles.invalidate();
        }
    });
    const {
        name,
        fileName,
        createdAt,
        tags,
        txHash,
    } = file;

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const handleLike = async () => {
        try {
            await likeFile.mutateAsync({ id: file.id });
        } catch (error: any) {
            const message = error.message ?? 'Oops! Something went wrong. Please try again.';
            toast.error(message);
        }
    }

    const handleDislike = async () => {
        try {
            await dislikeFile.mutateAsync({ id: file.id });
        } catch (error: any) {
            const message = error.message ?? 'Oops! Something went wrong. Please try again.';
            toast.error(message);
        }
    }

    useEffect(() => {
        setHasLiked(hasPreviouslyLiked);
    }, [hasPreviouslyLiked]);

    useEffect(() => {
        setHasDisliked(hasPreviouslyDisliked);
    }, [hasPreviouslyDisliked]);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full sm:w-[320px] md:w-[360px] lg:w-[400px] mx-auto"
        >
            <Card className="bg-white shadow-lg rounded-lg overflow-hidden h-full flex flex-col">
                <CardHeader className="bg-[#007F7F] text-white p-3 sm:p-4">
                    <CardTitle className="text-lg sm:text-xl font-bold truncate">{name}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 flex-grow">
                    <div className="flex items-center mb-2">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-600 truncate">{fileName}</span>
                    </div>
                    <div className="flex items-center mb-2">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-600">
                            {dayjs(createdAt).format('MMM D, YYYY')}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                        {tags ? tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs px-1 py-0.5">
                                {tag}
                            </Badge>
                        )) : (
                            <Badge variant="secondary" className="text-xs px-1 py-0.5">
                                No tags
                            </Badge>
                        )}
                    </div>
                    <div className="mt-3">
                        <a
                            href={transactionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold 
                            bg-emerald-100 text-emerald-800 
                            hover:bg-emerald-200 hover:text-emerald-900 
                            transition-colors duration-300 ease-in-out 
                            shadow-sm hover:shadow-md"
                        >
                            {formatTransactionHash(txHash)}
                            <SquareArrowOutUpRight className="w-3 h-3 ml-1" />
                        </a>
                    </div>
                </CardContent>
                <CardFooter className="bg-gray-50 p-3 sm:p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`flex items-center text-xs sm:text-sm p-1 sm:p-2`}
                            disabled={hasLiked}
                            onClick={handleLike}
                        >
                            {likeFile.isPending ? (
                                <RotateCw className="animate-spin w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            ) : (
                                <>
                                    <ThumbsUp className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${hasLiked ? "text-gray-500 fill-current" : ""}`} />
                                    <span>{likedAmount}</span>
                                </>
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className={`flex items-center text-xs sm:text-sm p-1 sm:p-2`}
                            disabled={hasDisliked}
                            onClick={handleDislike}
                        >
                            {dislikeFile.isPending ? (
                                <RotateCw className="animate-spin w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            ) : (
                                <>
                                    <ThumbsDown className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${hasDisliked ? "text-gray-500 fill-current" : ""}`} />
                                    <span>{dislikedAmount}</span>
                                </>
                            )}
                        </Button>
                    </div>

                    <FileDetailsDialog 
                        file={file} 
                        accountUsername={accountUsername} 
                        like={{
                            hasLiked,
                            likedAmount,
                            handleLike: () => { void handleLike() },
                            isLoading: likeFile.isPending
                        }}
                        dislike={{
                            hasDisliked,
                            dislikedAmount,
                            handleDislike: () => { void handleDislike() },
                            isLoading: dislikeFile.isPending
                        }} 
                    />
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default FileCard;

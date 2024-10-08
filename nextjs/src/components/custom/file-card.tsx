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

const FileCard = ({ file, hasPreviouslyLiked, hasPreviouslyDisliked }: { file: Files, hasPreviouslyLiked: boolean, hasPreviouslyDisliked: boolean }) => {
    const utils = api.useUtils();
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
        spin: { rotateY: 360 }
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
        >
            <Card className="w-full max-w-sm bg-white shadow-lg rounded-lg overflow-hidden">
                <CardHeader className="bg-[#007F7F] text-white p-4">
                    <CardTitle className="text-xl font-bold truncate">{name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                        <FileText className="w-5 h-5 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600 truncate">{fileName}</span>
                    </div>
                    <div className="flex items-center mb-2">
                        <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600">
                            {dayjs(createdAt).format('MMM D, YYYY')}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {tags ? tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                            </Badge>
                        )) : (
                            <Badge variant="secondary" className="text-xs">
                                No tags
                            </Badge>
                        )}
                    </div>
                    <div className="mt-4">
                        <a
                            href="#"
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold 
                            bg-emerald-100 text-emerald-800 
                            hover:bg-emerald-200 hover:text-emerald-900 
                            transition-colors duration-300 ease-in-out 
                            shadow-sm hover:shadow-md"
                        >
                            {formatTransactionHash(txHash)}
                            <SquareArrowOutUpRight className="w-3 h-3 ml-1.5" />
                        </a>
                    </div>
                </CardContent>
                <CardFooter className="bg-gray-50 p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`flex items-center`}
                            disabled={hasLiked}
                            onClick={handleLike}
                        >
                            {likeFile.isPending ? (
                                <RotateCw className="animate-spin w-4 h-4 mr-1" />
                            ) : (
                                <>
                                    <ThumbsUp className={`w-4 h-4 mr-1 ${hasLiked ? "text-gray-500 fill-current" : ""}`} />
                                    <span>{likedAmount}</span>
                                </>
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className={`flex items-center`}
                            disabled={hasDisliked}
                            onClick={handleDislike}
                        >
                            {dislikeFile.isPending ? (
                                <RotateCw className="animate-spin w-4 h-4 mr-1" />
                            ) : (
                                <>
                                    <ThumbsDown className={`w-4 h-4 mr-1 ${hasDisliked ? "text-gray-500 fill-current" : ""}`} />
                                    <span>{dislikedAmount}</span>
                                </>
                            )}
                        </Button>
                    </div>

                    {/* DETAILS DIALOG */}
                    <FileDetailsDialog file={file} />
                </CardFooter>
            </Card>
        </motion.div >
    );
};

export default FileCard;

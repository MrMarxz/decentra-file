"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, FileText, Calendar, ArrowUpRightSquare, SquareArrowOutUpRight } from 'lucide-react';
import { type Files } from '@prisma/client';
import dayjs from 'dayjs';
import { formatTransactionHash } from '@/lib/utils';

// interface ExtendedFile extends Files {
//     tags: string[] | null;
// }

const FileCard = ({ file }: { file: Files }) => {
    const {
        name,
        fileName,
        type,
        likes,
        dislikes,
        tags,
        createdAt,
        status,
        txHash,
    } = file;

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const formattedTags = tags as unknown as string[];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.3 }}
        >
            <Card className="w-full max-w-sm bg-white shadow-lg rounded-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4">
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
                        {formattedTags ? formattedTags.map((tag, index) => (
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
                        <Button variant="ghost" size="sm" className="flex items-center">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            <span>{likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center">
                            <ThumbsDown className="w-4 h-4 mr-1" />
                            <span>{dislikes}</span>
                        </Button>
                    </div>
                    <Button variant="outline" size="sm">
                        Details
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default FileCard;
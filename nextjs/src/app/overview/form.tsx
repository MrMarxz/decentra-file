"use client";
import FileCard from "@/components/custom/file-card";
import { api } from "@/trpc/react";
import { type Files } from "@prisma/client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FileObject {
    accountUsername: string | null,
    hasLiked: boolean,
    hasDisliked: boolean,
    file: Files
}

const LoadingAnimation = () => (
    <div className="flex items-center justify-center h-full">
        <motion.div
            className="flex space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {[0, 1, 2].map((index) => (
                <motion.div
                    key={index}
                    className="w-4 h-4 bg-[#007F7F] rounded-full"
                    animate={{
                        y: ['0%', '-50%', '0%'],
                        scale: [1, 0.8, 1],
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        delay: index * 0.2,
                    }}
                />
            ))}
        </motion.div>
    </div>
)

export default function OverviewForm() {
    const files = api.files.getCommunityFiles.useQuery();

    const [fileArray, setFileArray] = useState<FileObject[]>([]);

    useEffect(() => {
        if (files.data) {
            setFileArray(files.data);
        }
    }, [files]);

    return (
        <div className="flex flex-col justify-center px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Community Uploads</h1>
            {!files.isLoading && fileArray.length !== 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                    {fileArray.map((data, index) => (
                        <div key={index} className="w-full">
                            <FileCard
                                file={data.file}
                                hasPreviouslyLiked={data.hasLiked}
                                hasPreviouslyDisliked={data.hasDisliked}
                                accountUsername={data.accountUsername}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <LoadingAnimation />
            )}
        </div>
    );
}

import FileCard from "@/components/custom/file-card";
import { db } from "@/server/db";
import { api } from "@/trpc/server";
import { ProcessingStatus } from "@prisma/client";

export default async function Overview() {

    const files = await api.files.getCommunityFiles();

    if (!files) {
        return <div>No files found</div>;
    }

    return (
        <div className="flex flex-col justify-center px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Community Uploads</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                {files.map((data, index) => (
                    <div key={index} className="w-full">
                        <FileCard
                            file={data.file}
                            hasPreviouslyLiked={data.hasLiked}
                            hasPreviouslyDisliked={data.hasDisliked}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

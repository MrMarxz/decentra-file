import FileCard from "@/components/custom/file-card";
import { db } from "@/server/db";
import { api } from "@/trpc/server";
import { ProcessingStatus } from "@prisma/client";

export default async function Overview() {

    const files = await db.files.findMany({
        where: {
            status: ProcessingStatus.TRANSACTION_COMPLETE,
            txHash: {
                not: null,
            }
        }
    });

    if (!files) {
        return <div>No files found</div>;
    }

    return (
        <div className="flex flex-col justify-center px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Community Uploads</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                {files.map((file) => (
                    <div key={file.id} className="w-full">
                        <FileCard file={file} />
                    </div>
                ))}
            </div>
        </div>
    );
}

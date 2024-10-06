import { env } from "@/env";
import { PinataSDK } from "pinata";


interface RecordRequest {
    subject: string;
    grade: number;
    tags: string[];
}

export async function POST(request: Request) {
    try {
        const body = await request.formData();
        const file = body.get("file") as unknown as File;

        console.log("File: ", file);

        const pinata = new PinataSDK({
            pinataJwt: env.IPFS_JWT,
            pinataGateway: env.IPFS_DOMAIN,
        });

        const upload = await pinata.upload.file(file)

        console.log("Upload: ", upload);

        return new Response("Success", { status: 200 });
    } catch (e) {
        console.error(e);
        return new Response("Error", { status: 500 });
    }
}

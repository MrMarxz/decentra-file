import { isLoggedIn } from "@/actions/login";
import FileCard from "@/components/custom/file-card";
import { db } from "@/server/db";
import { api } from "@/trpc/server";
import { ProcessingStatus } from "@prisma/client";
import OverviewForm from "./form";

export default async function Overview() {

    return (
        <OverviewForm />
    );
}

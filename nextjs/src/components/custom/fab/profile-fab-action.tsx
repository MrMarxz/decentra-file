"use client";

import React, { useEffect, useState } from 'react';
import { User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import toast from 'react-hot-toast';
import { api } from '@/trpc/react';
import { Skeleton } from '@/components/ui/skeleton';


export default function UsernameEditDialog() {
    const [open, setOpen] = useState(false);
    const [username, setUsername] = useState('');

    const profile = api.user.getProfile.useQuery();

    const updateUsernameMutation = api.user.updateProfile.useMutation({
        onSuccess: () => {
            toast.success('Username updated!');
            setOpen(false);
        },
        onError: (error: any) => {
            const message = error.message ?? 'Failed to update username. Please try again.';
            toast.error(message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateUsernameMutation.mutate({ username });
    };

    useEffect(() => {
        if (profile.data) {
            setUsername(profile.data.username ?? "")
        }
    }, [profile.data]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="w-10 h-10 rounded-full shadow-lg transition-all duration-300 ease-in-out bg-primary text-white hover:text-white bg-[#007F7F] hover:bg-[#007F7F] hover:scale-110"
                >
                    <User className="h-5 w-5" />
                    <span className="sr-only">Edit Username</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-teal-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 border-0 shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center text-teal-700 dark:text-teal-300">Edit Username</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            New Username
                        </Label>
                        {profile.isLoading ? (
                            <Skeleton className="w-[100px] h-[20px] rounded-full" />
                        ) : (
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your new username"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
                            />
                        )}
                    </div>
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Button
                                type="submit"
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                                disabled={updateUsernameMutation.isPending || profile.isLoading}
                            >
                                {updateUsernameMutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                {updateUsernameMutation.isPending ? "Updating..." : "Update Username"}
                            </Button>
                        </motion.div>
                    </AnimatePresence>
                </form>
            </DialogContent>
        </Dialog>
    );
}
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, MessageSquare, HelpCircle, FileText } from 'lucide-react';
import AnnouncementFABAction from './profile-fab-action';
import UploadFileDialog from '../upload-dialog';
import ProfileFABAction from './profile-fab-action';

const TeacherFAB = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleCreateAnnouncement = () => console.log('Create announcement');

    const handleCreateAssignment = () => console.log('Create assignment');

    const handleCreateQuiz = () => console.log('Create quiz');

    const options = [
        { icon: MessageSquare, label: 'Announcement', onClick: handleCreateAnnouncement },
        { icon: FileText, label: 'Assignment', onClick: handleCreateAssignment },
        { icon: HelpCircle, label: 'Quiz', onClick: handleCreateQuiz },
    ];

    return (
        <TooltipProvider>
            <div className="fixed bottom-6 right-6 flex flex-col items-center">
                <div className={`flex flex-col gap-3 mb-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    <UploadFileDialog />
                    <ProfileFABAction />
                </div>
                <Button
                    variant="default"
                    size="icon"
                    className="w-14 h-14 rounded-full shadow-lg"
                    onClick={toggleMenu}
                >
                    <Plus className={`h-6 w-6 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </div>
        </TooltipProvider>
    );
};

export default TeacherFAB;

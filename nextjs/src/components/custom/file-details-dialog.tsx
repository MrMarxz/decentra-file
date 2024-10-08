import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Calendar, User, Hash, FileType } from "lucide-react";
import { type Files } from '@prisma/client';

const FileDetailsDialog = ({ file }: { file: Files }) => {
    const {
        name,
        fileName,
        cid,
        type,
        likes,
        dislikes,
        tags,
        uploadedBy,
        txHash,
        status,
        createdAt
    } = file;

    const ipfsUrl = `https://ipfs.io/ipfs/${cid}`;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Details
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{name}</DialogTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {tags ? tags.map((tag) => (
                            <Badge key={tag} variant="default">
                                {tag}
                            </Badge>
                        )) : (
                            <Badge variant="default">No tags</Badge>
                        )}
                    </div>
                </DialogHeader>
                <Card className="w-full mt-4">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <FileType className="w-5 h-5 text-gray-500" />
                                    <span>{type}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <User className="w-5 h-5 text-gray-500" />
                                    <span>Uploaded by: {uploadedBy}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                    <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Hash className="w-5 h-5 text-gray-500" />
                                    <span className="truncate">CID: {cid}</span>
                                </div>
                                {txHash && (
                                    <div className="flex items-center space-x-2">
                                        <Hash className="w-5 h-5 text-gray-500" />
                                        <span className="truncate">Tx Hash: {txHash}</span>
                                    </div>
                                )}
                                <div className="flex items-center space-x-4">
                                    <Button variant="outline" size="sm">
                                        <ThumbsUp className="w-4 h-4 mr-2" />
                                        {likes}
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <ThumbsDown className="w-4 h-4 mr-2" />
                                        {dislikes}
                                    </Button>
                                </div>
                            </div>
                            <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                                {type.startsWith('image/') ? (
                                    <img src={ipfsUrl} alt={name} className="w-full h-full object-contain" />
                                ) : type === 'application/pdf' ? (
                                    <iframe src={ipfsUrl} title={name} className="w-full h-full" />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p>Preview not available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-between p-6">
                        <Badge variant={status === 'UPLOADED_FILE' ? 'default' : 'secondary'}>
                            {status}
                        </Badge>
                        <Button onClick={() => window.open(ipfsUrl, '_blank')}>
                            View on IPFS
                        </Button>
                    </CardFooter>
                </Card>
            </DialogContent>
        </Dialog>
    );
};

export default FileDetailsDialog;
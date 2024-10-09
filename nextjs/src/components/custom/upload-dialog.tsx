/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import React, { useEffect, useState } from 'react';
import { createThirdwebClient, getContract, prepareContractCall } from "thirdweb";
import { localhost } from "thirdweb/chains";
import { useSendTransaction } from "thirdweb/react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import FileInput from './file-upload-input';
import { api } from '@/trpc/react';
import { RefreshCw, Upload, File as FileIcon, X } from 'lucide-react';
import useWallet from '@/store/useWallet';
import { env } from '@/env';

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const client = createThirdwebClient({ clientId: env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID });

interface FileData {
  cid: string;
  name: string;
  description: string;
  category: string;
  tags: string;
}

export default function ModernUploadFileDialog() {
  const walletStore = useWallet();
  const utils = api.useUtils();
  const contract = getContract({
    client,
    address: contractAddress,
    chain: localhost,
  });
  const { mutate: sendTx, data: transactionResult } = useSendTransaction();
  const upload = api.files.create.useMutation();
  const updateFile = api.files.postTransaction.useMutation();

  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [fileData, setFileData] = useState<FileData>({
    cid: '',
    name: '',
    description: '',
    category: '',
    tags: '',
  });

  const formFields = [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Enter file name' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe your file' },
    { name: 'category', label: 'Category', type: 'text', placeholder: 'e.g., Document, Image, Video' },
    { name: 'tags', label: 'Tags', type: 'text', placeholder: 'Enter tags separated by commas' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFileData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setUploadStatus(null);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(new Error(`FileReader error: ${JSON.stringify(error)}`));
    });
  };

  const handleSendTransaction = async (cid: string) => {
    const { name, description, category, tags } = fileData;
    const tagArray = tags.split(',').map(tag => tag.trim());

    if (!cid) {
      toast.error('Please upload a file first.');
      setIsLoading(false);
      return;
    }

    const transaction = prepareContractCall({
      contract,
      method: "function uploadFile(string _cid, string _name, string _description, string _category, string[] _tags) public",
      params: [cid, name, description, category, tagArray],
    });

    sendTx(transaction);
  };

  const handleSubmit = async () => {
    if (!file) {
      setUploadStatus('Please select a file first.');
      return;
    }

    if (!walletStore.isWalletConnected) {
      toast.error('Please connect your wallet first.');
      return;
    }

    setIsLoading(true);

    try {
      const base64 = await convertToBase64(file);
      const uploadFileResponse = await upload.mutateAsync({
        name: fileData.name,
        fileName: file.name,
        type: file.type,
        size: file.size,
        data: base64,
        tags: fileData.tags.split(',').map(tag => tag.trim()),
      });

      const cid = uploadFileResponse;
      setFileData(prev => ({ ...prev, cid }));
      await handleSendTransaction(cid);
    } catch (error) {
      toast.error('Upload failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleTransactionResult = async (txHash: string) => {
    try {
      await updateFile.mutateAsync({
        txHash,
        cid: fileData.cid
      });
      void utils.files.getCommunityFiles.invalidate();
      toast.success('File uploaded successfully!');
    } catch (error: any) {
      const message = error.message ?? 'An error occurred while processing the transaction.';
      toast.error(message);
    } finally {
      setIsLoading(false);
      setFile(null);
      setUploadStatus(null);
      setFileData({ cid: '', name: '', description: '', category: '', tags: '' });
    }
  };

  useEffect(() => {
    if (transactionResult?.transactionHash) {
      void handleTransactionResult(transactionResult.transactionHash);
    }
  }, [transactionResult]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-full shadow-lg transition-all duration-300 ease-in-out bg-primary text-white hover:text-white bg-[#007F7F] hover:bg-[#007F7F] hover:scale-110"
        >
          <Upload className="h-6 w-6" />
          <span className="sr-only">Upload File</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-gray-900 dark:to-cyan-950 border-0 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-teal-700 dark:text-teal-300">Upload to Blockchain</DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            Share files globally with a click. Your uploads are distributed across a secure network and recorded on a blockchain, ensuring availability and authenticity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {formFields.map(field => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
              </Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={fileData[field.name as keyof FileData]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
                />
              ) : (
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={fileData[field.name as keyof FileData]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
                />
              )}
            </div>
          ))}

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              File
            </Label>
            <FileInput
              onFileSelect={handleFileSelect}
              accept="image/*,application/pdf"
              maxSize={5 * 1024 * 1024}
            />
          </div>

          <AnimatePresence>
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <FileIcon className="h-5 w-5 text-teal-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {uploadStatus && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-2 text-sm ${uploadStatus.includes('success') ? 'text-green-500' : 'text-red-500'}`}
              >
                {uploadStatus}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !file}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="animate-spin w-5 h-5 mr-2" />
            ) : (
              <Upload className="w-5 h-5 mr-2" />
            )}
            {isLoading ? "Uploading..." : "Upload to Blockchain"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
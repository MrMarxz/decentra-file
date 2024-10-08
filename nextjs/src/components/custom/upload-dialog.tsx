/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { env } from '@/env';
import React, { useEffect, useState } from 'react';
import { createThirdwebClient, getContract, prepareContractCall } from "thirdweb";
import { localhost } from "thirdweb/chains";
import { useSendTransaction } from "thirdweb/react";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from '@/components/ui/textarea';
import FileInput from './file-upload-input';
import { api } from '@/trpc/react';
import { RefreshCw, Plus } from 'lucide-react';
import useWallet from '@/store/useWallet';

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const client = createThirdwebClient({ clientId: env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID });

interface FileData {
  cid: string;
  name: string;
  description: string;
  category: string;
  tags: string;
}

export default function UploadFileDialog() {
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
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'category', label: 'Category', type: 'text' },
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
    // Here you would call your contract method to upload the file
    const { name, description, category, tags } = fileData;
    const tagArray = tags.split(',').map(tag => tag.trim());

    // Check if the CID is not empty
    if (!cid) {
      toast.error('Please upload a file first.');
      setIsLoading(false);
      return;
    }

    const transaction = prepareContractCall({
      contract,
      method: "function uploadFile(string _cid, string _name, string _description, string _category, string[] _tags) public",
      params: [cid, name, description, category, tagArray],
    })

    // Send the transaction
    sendTx(transaction);
  }

  const handleSubmit = async () => {
    // Upload file to IPFS
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
      const name = fileData.name;
      const tags = fileData.tags.split(',').map(tag => tag.trim());
      const base64 = await convertToBase64(file);
      const uploadFileResponse = await upload.mutateAsync({
        name: name,
        fileName: file.name,
        type: file.type,
        size: file.size,
        data: base64,
        tags: tags,
      });

      // Update the file data with the CID
      const cid = uploadFileResponse;
      setFileData(prev => ({ ...prev, cid }));

      // Execute the transaction
      await handleSendTransaction(cid);
    } catch (error) {
      toast.error('Upload failed. Please try again.');
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
      // Reset the form
      setFile(null);
      setUploadStatus(null);
      setFileData({
        cid: '',
        name: '',
        description: '',
        category: '',
        tags: '',
      });
    }
  }

  useEffect(() => {
    if (transactionResult?.transactionHash) {
      // Transaction was successful, update the database
      void handleTransactionResult(transactionResult.transactionHash);
    }
  }, [transactionResult]);


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 bg-blue-900"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload a File to the Blockchain!</DialogTitle>
          <DialogDescription>
            {"Share files globally with a click. Your uploads are distributed across a secure network and recorded on a blockchain, ensuring availability and authenticity."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">

          {formFields.map(field => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="text-right">
                {field.label}
              </Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={fileData[field.name as keyof FileData]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="col-span-3"
                />
              ) : (
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={fileData[field.name as keyof FileData]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="col-span-3"
                />
              )}
            </div>
          ))}

          <FileInput
            onFileSelect={handleFileSelect}
            accept="image/*,application/pdf"
            maxSize={5 * 1024 * 1024} // 5MB limit
          />
          {uploadStatus && (
            <p className={`mt-2 text-sm ${uploadStatus.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
              {uploadStatus}
            </p>
          )}

        </div>
        <DialogFooter>
          <Button type="button" onClick={(e) => handleSubmit()} disabled={isLoading || !file}>
            {isLoading && (
              <RefreshCw className="animate-spin w-4 h-4 mx-2" />
            )}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
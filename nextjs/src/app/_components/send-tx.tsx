"use client";

import { env } from '@/env';
import React, { useEffect, useState } from 'react';
import { createThirdwebClient, getContract, prepareContractCall } from "thirdweb";
import { localhost } from "thirdweb/chains";
import { useReadContract, useSendTransaction } from "thirdweb/react";

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

  const contract = getContract({
    client,
    address: contractAddress,
    chain: localhost,
  });
  const { mutate: sendTx, data: transactionResult } = useSendTransaction();

  const [fileData, setFileData] = useState<FileData>({
    cid: 'QmTest',
    name: 'TestFile',
    description: 'Description',
    category: 'Category',
    tags: 'tag1,tag2',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // e.preventDefault();
    // console.log("Submitting file data: ", fileData);
    // // Here you would call your contract method to upload the file
    // const { cid, name, description, category, tags } = fileData;
    // const tagArray = tags.split(',').map(tag => tag.trim());

    const transaction = prepareContractCall({
      contract,
      method: "function uploadFile(string _cid, string _name, string _description, string _category, string[] _tags) public",
      // params: [cid, name, description, category, tagArray],
      params: ["QmTest", "TestFile", "Description", "Category", ["tag1", "tag2"]],
    })

    // Send the transaction
    sendTx(transaction);

    console.log("Transaction sent: ", transaction);
  };

  const formFields = [
    { name: 'cid', label: 'CID', type: 'text' },
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'tags', label: 'Tags', type: 'text', placeholder: 'Enter tags separated by commas' },
  ];

  useEffect(() => {
    if (transactionResult) {
      console.log("Transaction result: ", transactionResult);
    }
  }, [transactionResult]);


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Upload File</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload a File to the Blockchain!</DialogTitle>
          <DialogDescription>
            {""}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">

          {formFields.map(field => (
            <div key={field.name} className="grid grid-cols-4 items-center gap-4">
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

        </div>
        <DialogFooter>
          <Button type="button" onClick={(e) => handleSubmit()}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
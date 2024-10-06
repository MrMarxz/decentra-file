import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import CustomFileInput from './file-upload-input';
import { api } from '@/trpc/react';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';

const FileUploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const upload = api.files.create.useMutation();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadStatus('Please select a file first.');
      return;
    }

    try {

      // Send file through the formData
      // const formData = new FormData();
      // formData.append('file', file);

      // const res = await axios.post('/api/upload', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });

      const base64 = await convertToBase64(file);

      const result = await upload.mutateAsync({
        name: file.name,
        fileName: "",
        type: file.type,
        size: file.size,
        data: base64,
        tags: []
      });

      setUploadStatus(`File "${file.name}" uploaded successfully!`);
      
      setUploadStatus(`File uploaded successfully!`);
    } catch (error) {
      setUploadStatus('Upload failed. Please try again.');
      console.error('Upload error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>File Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <CustomFileInput
            onFileSelect={handleFileSelect}
            accept="image/*,application/pdf"
            maxSize={5 * 1024 * 1024} // 5MB limit
          />
          {uploadStatus && (
            <p className={`mt-2 text-sm ${uploadStatus.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
              {uploadStatus}
            </p>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={upload.isPending || !file}
          className="w-full"
        >
          {upload.isPending && (
            <RefreshCw className="animate-spin w-4 h-4 mx-2" />
          )}
          Upload File
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileUploadForm;
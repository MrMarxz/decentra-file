import React, { useRef, ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomFileInputProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
}

const FileInput: React.FC<CustomFileInputProps> = ({ 
  onFileSelect, 
  accept = 'image/*,application/pdf', 
  maxSize = 5 * 1024 * 1024 // 5MB default
}) => {
  const [fileName, setFileName] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);

    if (file) {
      if (maxSize && file.size > maxSize) {
        setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit.`);
        return;
      }

      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload" className="text-sm font-medium">
        Upload File
      </Label>
      <div className="flex items-center space-x-2">
        <Input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
          accept={accept}
        />
        <Button
          onClick={handleButtonClick}
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <Upload className="mr-2 h-4 w-4" />
          {fileName || 'Select a file'}
        </Button>
      </div>
      {fileName && (
        <p className="text-sm text-muted-foreground">
          Selected: {fileName}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default FileInput;
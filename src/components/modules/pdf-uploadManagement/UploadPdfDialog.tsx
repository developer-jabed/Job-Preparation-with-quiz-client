"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { uploadPdf } from "@/service/pdf-upload/pdfUpload.service";

interface Subject {
  id: string;
  name: string;
}

export function UploadPdfDialog({ subjects }: { subjects: Subject[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await uploadPdf(formData);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || "Upload failed");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Question Paper (PDF)</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">PDF File *</Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept="application/pdf"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Subject *</Label>
            <Select name="subjectId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="examName">Exam Name (optional)</Label>
            <Input id="examName" name="examName" placeholder="e.g. SSC CGL 2024" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year (optional)</Label>
            <Input id="year" name="year" type="number" placeholder="2024" />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Uploading…" : "Upload PDF"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
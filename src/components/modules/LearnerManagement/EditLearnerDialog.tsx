// components/modules/LearnerManagement/EditLearnerDialog.tsx
"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Learner, updateLearner } from "@/service/learners/learner.service";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export function EditLearnerDialog({
  learner,
  open,
  onOpenChange,
}: {
  learner: Learner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState(
    learner?.preferredLanguage || "en"
  );
  const [isActive, setIsActive] = useState(
    learner?.isActive ? "true" : "false"
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // Reset on close — event handler, not effect
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      if (learner) {
        setPreferredLanguage(learner.preferredLanguage || "en");
        setIsActive(learner.isActive ? "true" : "false");
      }
    } else if (learner) {
      // Sync when opening
      setPreferredLanguage(learner.preferredLanguage || "en");
      setIsActive(learner.isActive ? "true" : "false");
    }
    onOpenChange(next);
  };

  if (!learner) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("preferredLanguage", preferredLanguage);
    formData.set("isActive", isActive);

    startTransition(async () => {
      const res = await updateLearner(learner.id, formData);
      if (res.success) {
        toast.success(res.message || "Learner updated");
        handleOpenChange(false);
        router.refresh();
      } else {
        toast.error(res.message || "Update failed");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit learner</DialogTitle>
          <DialogDescription>
            Update profile details for {learner.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border bg-muted">
              {(preview || learner.avatar) && (
                <Image
                  src={preview || learner.avatar!}
                  alt={learner.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <input
                ref={fileRef}
                type="file"
                name="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setPreview(URL.createObjectURL(f));
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                Change photo
              </Button>
              {preview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-muted-foreground"
                  onClick={() => {
                    setPreview(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                >
                  <X className="h-3 w-3" />
                  Remove
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">Full name</Label>
            <Input
              id="edit-name"
              name="name"
              defaultValue={learner.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={learner.email} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phone">Phone</Label>
            <Input
              id="edit-phone"
              name="phone"
              defaultValue={learner.phone || ""}
              placeholder="+880…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-lang">Preferred language</Label>
            <Select
              value={preferredLanguage}
              onValueChange={setPreferredLanguage}
            >
              <SelectTrigger id="edit-lang">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="bn">বাংলা</SelectItem>
                <SelectItem value="hi">हिन्दी</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={isActive} onValueChange={setIsActive}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
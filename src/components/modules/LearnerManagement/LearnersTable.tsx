// components/modules/learner/LearnersTable.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Learner,
  deleteLearner,
  toggleLearnerActive,
} from "@/service/learners/learner.service";
import { LearnerStatusBadge } from "./LearnerStatusBadge";
import { EditLearnerDialog } from "./EditLearnerDialog";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Flame,
  Users,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";

function Avatar({ learner }: { learner: Learner }) {
  const initials = learner.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (learner.avatar) {
    return (
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border">
        <Image
          src={learner.avatar}
          alt={learner.name}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
      {initials}
    </div>
  );
}

function LearnerRow({ learner }: { learner: Learner }) {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleLearnerActive(learner.id, !learner.isActive);
      if (res.success) {
        toast.success(
          learner.isActive ? "Learner deactivated" : "Learner activated"
        );
        router.refresh();
      } else {
        toast.error(res.message || "Failed");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteLearner(learner.id);
      if (res.success) {
        toast.success(res.message || "Deleted");
        setDeleteOpen(false);
        router.refresh();
      } else {
        toast.error(res.message || "Delete failed");
      }
    });
  };

  return (
    <>
      <TableRow className="group hover:bg-muted/40">
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar learner={learner} />
            <div className="min-w-0">
              <p className="truncate font-medium text-sm">{learner.name}</p>
              <p className="truncate text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3 shrink-0" />
                {learner.email}
              </p>
            </div>
          </div>
        </TableCell>

        <TableCell className="text-sm text-muted-foreground">
          {learner.phone ? (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {learner.phone}
            </span>
          ) : (
            <span className="text-muted-foreground/50">—</span>
          )}
        </TableCell>

        <TableCell>
          <LearnerStatusBadge isActive={learner.isActive} />
        </TableCell>

        <TableCell>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
              learner.isEmailVerified
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border-border bg-muted text-muted-foreground"
            )}
          >
            {learner.isEmailVerified ? (
              <ShieldCheck className="h-3 w-3" />
            ) : (
              <ShieldOff className="h-3 w-3" />
            )}
            {learner.isEmailVerified ? "Verified" : "Unverified"}
          </span>
        </TableCell>

        <TableCell>
          {typeof learner.streakDays === "number" && learner.streakDays > 0 ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 dark:text-orange-400">
              <Flame className="h-3.5 w-3.5" />
              {learner.streakDays}d
            </span>
          ) : (
            <span className="text-muted-foreground/50 text-sm">—</span>
          )}
        </TableCell>

        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
          {new Date(learner.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </TableCell>

        <TableCell className="text-right pr-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={isPending}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                className="gap-2"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={handleToggle}>
                {learner.isActive ? (
                  <>
                    <BanIcon className="h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-red-600 focus:text-red-600"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <EditLearnerDialog
        learner={learner}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {learner.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the learner account and related data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isPending}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function BanIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M4.93 4.93l14.14 14.14" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function LearnersTable({ learners }: { learners: Learner[] }) {
  if (learners.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-medium">No learners found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting filters or add a new learner.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Learner</TableHead>
            <TableHead className="w-[140px]">Phone</TableHead>
            <TableHead className="w-[110px]">Status</TableHead>
            <TableHead className="w-[120px]">Email</TableHead>
            <TableHead className="w-[80px]">Streak</TableHead>
            <TableHead className="w-[110px]">Joined</TableHead>
            <TableHead className="w-12 pr-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {learners.map((l) => (
            <LearnerRow key={l.id} learner={l} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
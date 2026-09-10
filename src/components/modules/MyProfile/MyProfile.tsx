/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Mail,
  Shield,
  Edit2,
  Calendar,
  Phone,
  User,
  Clock,
  X,
  Upload,
  Save,
  Lock,
  CheckCircle2,
  Loader2,
  Flame,
  Languages,
  BadgeCheck,
  Ban,
} from "lucide-react";
import { updateMyProfile } from "@/service/auth/auth.service"; // adjust path
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";

export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  avatar: string | null;
  preferredLanguage: string;
  isEmailVerified: boolean;
  isActive: boolean;
  streakDays: number;
  lastActiveAt: string | null;
  createdAt: string;
}

type Tab = "overview" | "security";

function fmt(d?: string | null) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-medium text-foreground break-words",
          mono && "font-mono text-xs"
        )}
      >
        {value || "—"}
      </p>
    </div>
  );
}

export default function ProfileClient({
  initialUser,
}: {
  initialUser: ProfileUser;
}) {
  const [user, setUser] = useState(initialUser);
  const [tab, setTab] = useState<Tab>("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState(
    initialUser.preferredLanguage || "en"
  );
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const openEdit = () => {
    setPreferredLanguage(user.preferredLanguage || "en");
    setPhotoPreview(null);
    setIsEditing(true);
  };

  const closeEdit = () => {
    if (isPending) return;
    setIsEditing(false);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setPhotoPreview(URL.createObjectURL(f));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("preferredLanguage", preferredLanguage);

    startTransition(async () => {
      const result = await updateMyProfile(formData);
      if (result?.success) {
        toast.success(result.message || "Profile updated");
        // Optimistic local update
        const name = formData.get("name") as string;
        const phone = (formData.get("phone") as string) || null;
        setUser((prev) => ({
          ...prev,
          name: name || prev.name,
          phone,
          preferredLanguage,
          avatar: photoPreview || prev.avatar,
        }));
        setIsEditing(false);
        setPhotoPreview(null);
        router.refresh();
      } else {
        toast.error(result?.message || "Update failed");
      }
    });
  };

  const avatarSrc = photoPreview || user.avatar;

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Account</h2>
          <p className="text-sm text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>
        <Button onClick={openEdit} className="gap-2 shadow-sm">
          <Edit2 className="h-4 w-4" />
          Edit profile
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* ── Sidebar card ── */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="h-16 bg-gradient-to-r from-violet-500/90 to-indigo-500/90" />
            <div className="px-5 pb-5 -mt-8 text-center">
              <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full border-4 border-card bg-muted shadow-md">
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={user.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary">
                    {initials}
                  </div>
                )}
              </div>
              <h3 className="mt-3 text-base font-semibold truncate">
                {user.name}
              </h3>
              <p className="mt-0.5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground truncate">
                <Mail className="h-3 w-3 shrink-0" />
                {user.email}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide">
                  <Shield className="h-3 w-3" />
                  {user.role}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                    user.isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  )}
                >
                  {user.isActive ? (
                    <BadgeCheck className="h-3 w-3" />
                  ) : (
                    <Ban className="h-3 w-3" />
                  )}
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4">
                <div className="rounded-lg bg-muted/40 px-2 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Streak
                  </p>
                  <p className="mt-0.5 flex items-center justify-center gap-1 text-sm font-semibold text-orange-600">
                    <Flame className="h-3.5 w-3.5" />
                    {user.streakDays ?? 0}d
                  </p>
                </div>
                <div className="rounded-lg bg-muted/40 px-2 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Joined
                  </p>
                  <p className="mt-0.5 text-xs font-semibold">
                    {fmt(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Activity
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <div>
                  <p className="font-medium">Last active</p>
                  <p className="text-xs text-muted-foreground">
                    {fmt(user.lastActiveAt)}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/40" />
                <div>
                  <p className="font-medium">Account created</p>
                  <p className="text-xs text-muted-foreground">
                    {fmt(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main panel ── */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="border-b px-5 pt-4">
            <div className="flex gap-1">
              {(
                [
                  { key: "overview", label: "Overview", icon: User },
                  { key: "security", label: "Security", icon: Lock },
                ] as const
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={cn(
                    "flex items-center gap-1.5 border-b-2 px-3 pb-3 text-sm font-medium transition-colors",
                    tab === key
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {tab === "overview" && (
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Full name" value={user.name} />
                <Field label="Email" value={user.email} />
                <Field label="Phone" value={user.phone} />
                <Field
                  label="Preferred language"
                  value={
                    user.preferredLanguage === "bn"
                      ? "বাংলা"
                      : user.preferredLanguage === "hi"
                      ? "हिन्दी"
                      : "English"
                  }
                />
                <Field label="Role" value={user.role} />
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Email verification
                  </p>
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    {user.isEmailVerified ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Ban className="h-4 w-4 text-amber-600" />
                        Not verified
                      </>
                    )}
                  </p>
                </div>
                <Field label="User ID" value={user.id} mono />
                <Field label="Member since" value={fmt(user.createdAt)} />
              </div>
            )}

            {tab === "security" && (
              <div className="space-y-4 max-w-md">
                <p className="text-sm text-muted-foreground">
                  Password changes are handled from the security settings page
                  for extra protection.
                </p>
                <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="h-4 w-4" />
                    Password
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use a strong password you don’t reuse elsewhere.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <a href="/change-password">Change password</a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Edit modal ── */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={closeEdit}
        >
          <div
            className="w-full max-w-md rounded-2xl border bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500" />

            <div className="flex items-start justify-between gap-3 px-5 pt-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Edit profile</h3>
                  <p className="text-xs text-muted-foreground">
                    Update your name, phone, photo, and language
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 px-5 py-5">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border bg-muted">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-primary">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <input
                    ref={fileRef}
                    type="file"
                    name="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhoto}
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
                  {photoPreview && (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setPhotoPreview(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                    >
                      Remove preview
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={user.name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={user.phone || ""}
                  placeholder="+880…"
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred language</Label>
                <Select
                  value={preferredLanguage}
                  onValueChange={setPreferredLanguage}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="bn">বাংলা</SelectItem>
                    <SelectItem value="hi">हिन्दी</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-3 border-t pt-4">
                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Encrypted & secure
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeEdit}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending} className="gap-1.5">
                    {isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        Save changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
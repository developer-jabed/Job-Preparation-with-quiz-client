"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/service/auth/logoutUser";
import { toast } from "sonner";
import { LogOut, AlertTriangle, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

const LogoutButton = ({ className }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      toast.success("সফলভাবে লগআউট হয়েছে");
      setOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("লগআউট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50 hover:text-red-700",
          className
        )}
      >
        <LogOut className="h-4 w-4" />
        লগআউট
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => !loading && setOpen(false)}
          />

          {/* Dialog */}
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-red-600 via-red-500 to-rose-500" />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <AlertTriangle className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      লগআউট করবেন?
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  বাতিল
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  disabled={loading}
                  onClick={handleLogout}
                  className="flex flex-1 items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      লগআউট হচ্ছে…
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      লগআউট
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogoutButton;
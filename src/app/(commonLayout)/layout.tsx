import PublicFooter from "@/components/shared/PublicFooter";
import PublicNavbar from "@/components/shared/PublicNavbar";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f6f1]">
      {/* Soft gradient base */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/70 via-[#f8f6f1] to-[#f1efe9]" />

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(15, 23, 42, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Soft emerald glow (top right) */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-emerald-200/25 blur-3xl" />

      {/* Soft warm glow (bottom left) */}
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-[380px] w-[380px] rounded-full bg-amber-100/30 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <PublicNavbar />

        <main className="flex-1">{children}</main>

        <PublicFooter />
      </div>
    </div>
  );
};

export default CommonLayout;
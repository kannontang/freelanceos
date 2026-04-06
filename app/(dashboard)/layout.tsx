import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 p-4">
        <div className="mb-8">
          <h1 className="text-lg font-bold text-white">FreelanceOS</h1>
          <p className="text-xs text-zinc-500">Your admin runs itself</p>
        </div>
        <nav className="space-y-1">
          {[
            { href: "/dashboard", label: "Dashboard", icon: "◈" },
            { href: "/projects", label: "Projects", icon: "◇" },
            { href: "/invoices", label: "Invoices", icon: "○" },
            { href: "/clients", label: "Clients", icon: "◉" },
            { href: "/settings", label: "Settings", icon: "⚙" },
          ].map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

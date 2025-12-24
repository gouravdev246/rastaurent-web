import Image from "next/image";
import { RefreshCw } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <div className="glass p-12 rounded-2xl animate-in max-w-lg w-full">
        <h1 className="text-4xl font-bold mb-4 text-[hsl(var(--primary))]">Rastaurent</h1>
        <p className="text-xl text-[hsl(var(--muted-foreground))] mb-8">
          Premium Dining Experience
        </p>

        <div className="flex flex-col gap-4">
          <a href="/admin/login" className="bg-primary text-primary-foreground py-3 px-6 rounded-xl font-bold hover:bg-primary/90 transition-colors">
            Go to Admin Portal
          </a>
          <p className="text-xs text-muted-foreground mt-2">
            * Requires Supabase Auth User
          </p>
        </div>
      </div>
    </main>
  );
}

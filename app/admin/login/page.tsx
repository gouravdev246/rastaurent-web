import { login } from '../actions';
import { ChefHat } from 'lucide-react';

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/50 via-background to-background" />

            <div className="z-10 w-full max-w-md glass p-8 rounded-2xl border border-white/10 shadow-2xl animate-in">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary/10 p-4 rounded-full mb-4 ring-1 ring-primary/20">
                        <ChefHat className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Sign in to manage your restaurant
                    </p>
                </div>

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 ml-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="admin@restaurant.com"
                            className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 ml-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        formAction={login}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-primary/25 mt-4"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}

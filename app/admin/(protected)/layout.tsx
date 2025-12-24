import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Sidebar from './sidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/admin/login');
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar user={{ email: user.email }} />

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-secondary/5 relative pt-16 lg:pt-0">
                <div className="h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}

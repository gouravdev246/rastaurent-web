import { createClient } from '@/utils/supabase/server';
import { StatCard, QuickAction } from './components';
import { AIToggle } from './ai-toggle';
import { getAdminSettings } from './actions';

export default async function DashboardPage() {
    const supabase = await createClient();

    // 1. Get Today's Revenue (Paid orders only)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'Paid')
        .gte('created_at', startOfToday);

    const todaysRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    // 2. Get Active Orders (New or Preparing)
    const { count: activeOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['New', 'Preparing']);

    // 3. Get Total Tables
    const { count: tablesCount } = await supabase
        .from('tables')
        .select('*', { count: 'exact', head: true });

    const settings = await getAdminSettings();

    return (
        <div className="p-4 md:p-8">
            <div className="mb-6 md:mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-background to-secondary border border-primary/10 p-6 md:p-8">
                <div className="relative z-10">
                    <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground max-w-xl">
                        Here's what's happening in your restaurant today.
                    </p>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                <StatCard
                    title="Today's Revenue"
                    value={`₹${todaysRevenue.toFixed(2)}`}
                    subtitle="Processed Payments"
                    trend="neutral"
                />
                <StatCard
                    title="Active Kitchen Orders"
                    value={activeOrdersCount || 0}
                    subtitle="Currently preparing"
                    trend="neutral"
                />
                <StatCard
                    title="Total Tables"
                    value={tablesCount || 0}
                    subtitle="Registered"
                    trend="neutral"
                />
            </div>

            <div className="mb-8">
                <h2 className="text-lg md:text-xl font-bold mb-4">Features & Content</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <AIToggle initialStatus={settings?.is_ai_enabled ?? true} />
                </div>
            </div>

            <h2 className="text-lg md:text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <QuickAction href="/admin/orders" label="View Live Orders" />
                <QuickAction href="/admin/menu" label="Update Menu" />
                <QuickAction href="/admin/tables" label="Manage Tables" />
                <QuickAction href="/admin/branding" label="Manage Posters" />
            </div>
        </div>
    );
}


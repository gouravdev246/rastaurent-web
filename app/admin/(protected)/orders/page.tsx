import { createClient } from '@/utils/supabase/server';
import dynamic from 'next/dynamic';

const KitchenBoard = dynamic(() => import('./kitchen-board'), {
    loading: () => <div className="p-10 text-center animate-pulse">Loading Kitchen Board...</div>,
    ssr: false
});

export default async function OrdersPage() {
    const supabase = await createClient();

    // Need to fetch relations: tables, order_items -> menu_items
    const { data: orders } = await supabase
        .from('orders')
        .select(`
        *,
        tables (name),
        order_items (
            quantity,
            menu_items (name)
        )
    `)
        .order('created_at', { ascending: false });

    return (
        <div className="p-4 md:p-8 h-screen flex flex-col overflow-hidden">
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">Kitchen Monitor</h1>
                <p className="text-sm text-muted-foreground">Manage active orders in real-time.</p>
            </div>
            <KitchenBoard initialOrders={orders || []} />
        </div>
    );
}

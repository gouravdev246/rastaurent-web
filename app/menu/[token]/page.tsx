import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import CustomerApp from './customer-app';

export default async function MenuPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const supabase = await createClient();

    // 1. Fetch Table
    const { data: table } = await supabase
        .from('tables')
        .select('*')
        .eq('token', token)
        .single();

    if (!table) {
        return notFound();
    }

    // 2. Fetch Categories & Items
    // Filter by the Table's Owner (user_id) to ensure multi-tenant isolation
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', table.user_id)
        .order('sort_order', { ascending: true });

    const { data: items } = await supabase
        .from('menu_items')
        .select('*')
        .eq('user_id', table.user_id)
        .eq('is_available', true);

    // 3. Fetch Active Posters
    const { data: posters } = await supabase
        .from('posters')
        .select('*')
        .eq('user_id', table.user_id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    // 4. Fetch Admin Settings
    const { data: settings } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('user_id', table.user_id)
        .single();

    return (
        <CustomerApp
            table={table}
            categories={categories || []}
            items={items || []}
            posters={posters || []}
            adminSettings={settings || { is_ai_enabled: true }}
        />
    );
}


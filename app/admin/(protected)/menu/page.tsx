import { createClient } from '@/utils/supabase/server';
import MenuManager from './menu-manager';

export default async function MenuPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        // Handle no user (redirect or empty)
        return null;
    }

    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

    if (catError) console.error('Error fetching categories:', catError);

    const { data: menuItems, error: itemError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

    if (itemError) console.error('Error fetching menu items:', itemError);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Menu Management</h1>
            <MenuManager
                categories={categories || []}
                menuItems={menuItems || []}
            />
        </div>
    );
}

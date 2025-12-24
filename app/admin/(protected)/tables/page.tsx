import { createClient } from '@/utils/supabase/server';
import TableManager from './table-manager';

export default async function TablesPage() {
    const supabase = await createClient();
    const { data: tables } = await supabase.from('tables').select('*').order('created_at', { ascending: true });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tables & QR Codes</h1>
                    <p className="text-muted-foreground mt-1">Manage your restaurant tables and generate QR codes.</p>
                </div>
            </div>

            <TableManager tables={tables || []} />
        </div>
    );
}

'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getAdminSettings() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error('Error fetching settings:', error);
        return null;
    }

    return data || { is_ai_enabled: true };
}

export async function updateAISetting(enabled: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('admin_settings')
        .upsert({
            user_id: user.id,
            is_ai_enabled: enabled,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

    if (error) {
        console.error('Error updating AI setting:', error);
        return { error: 'Failed to update setting' };
    }

    revalidatePath('/admin/dashboard');
    revalidatePath('/menu');
    return { success: true };
}

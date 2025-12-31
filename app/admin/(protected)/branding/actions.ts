'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// ==================== ADMIN SETTINGS ====================

export async function getAdminSettings() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error('Error fetching admin settings:', error);
        return null;
    }
    return data;
}

export async function updateRestaurantName(name: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // Use upsert to handle both insert and update cases atomically.
    // This avoids race conditions and "duplicate key" errors if the row exists but wasn't found by select.
    // referencing the unique constraint on user_id.
    const { error } = await supabase
        .from('admin_settings')
        .upsert({
            user_id: user.id,
            restaurant_name: name
        }, {
            onConflict: 'user_id'
        });

    if (error) {
        console.error('Error updating restaurant name:', error);
        return { error: error.message || 'Failed to update restaurant name' };
    }

    revalidatePath('/admin/branding');
    revalidatePath('/menu');
    return { success: true };
}

// ==================== POSTERS ====================

export async function getPosters() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('posters')
        .select(`
            *,
            menu_item:menu_items(id, name)
        `)
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching posters:', error);
        return [];
    }
    return data || [];
}

export async function getMenuItemsForSelection() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('menu_items')
        .select('id, name')
        .eq('is_available', true)
        .order('name');

    if (error) {
        console.error('Error fetching menu items:', error);
        return [];
    }
    return data || [];
}

export async function createPoster(title: string, imageUrl: string, menuItemId: string | null) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const newPoster = {
        title,
        image_url: imageUrl,
        is_active: true,
        menu_item_id: menuItemId || null,
        user_id: user.id
    };

    const { error } = await supabase.from('posters').insert(newPoster);

    if (error) {
        console.error('Error creating poster:', error);
        return { error: 'Failed to create poster' };
    }

    revalidatePath('/admin/branding');
    revalidatePath('/menu');
    return { success: true };
}

export async function updatePoster(id: string, title: string, imageUrl: string, menuItemId: string | null) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('posters')
        .update({
            title,
            image_url: imageUrl,
            menu_item_id: menuItemId || null
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating poster:', error);
        return { error: 'Failed to update poster' };
    }

    revalidatePath('/admin/branding');
    revalidatePath('/menu');
    return { success: true };
}

export async function deletePoster(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('posters')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting poster:', error);
        return { error: 'Failed to delete poster' };
    }

    revalidatePath('/admin/branding');
    revalidatePath('/menu');
    return { success: true };
}

export async function togglePosterStatus(id: string, isActive: boolean) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('posters')
        .update({ is_active: isActive })
        .eq('id', id);

    if (error) {
        console.error('Error toggling poster:', error);
        return { error: 'Failed to toggle poster status' };
    }

    revalidatePath('/admin/branding');
    revalidatePath('/menu');
    return { success: true };
}

export async function uploadPosterImage(formData: FormData) {
    const supabase = await createClient();
    const file = formData.get('file') as File;

    if (!file) {
        return { error: 'No file provided' };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `posters/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return { error: 'Failed to upload image' };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

    return { url: publicUrl };
}

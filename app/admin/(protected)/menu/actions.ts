'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// --- Categories ---
export async function createCategory(formData: FormData) {
    const supabase = await createClient();
    const name = formData.get('name') as string;

    if (!name) return { error: 'Name is required' };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase.from('categories').insert({ name, user_id: user.id });

    if (error) return { error: `Failed to create category: ${error.message}` };

    revalidatePath('/admin/menu');
    return { success: true };
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // 1. First delete all menu_items in this category
    const { error: itemsError } = await supabase
        .from('menu_items')
        .delete()
        .eq('category_id', id)
        .eq('user_id', user.id);

    if (itemsError) {
        console.error('Error deleting category items:', itemsError);
        return { error: `Failed to delete items in category: ${itemsError.message}` };
    }

    // 2. Then delete the category
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Category delete error:', error);
        return { error: `Failed to delete category: ${error.message}` };
    }

    revalidatePath('/admin/menu');
    revalidatePath('/');
    return { success: true };
}

// --- Items ---
export async function createMenuItem(formData: FormData) {
    const supabase = await createClient();

    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const category_id = formData.get('category_id') as string;
    const description = formData.get('description') as string;
    const imageFile = formData.get('image') as File;
    const imageUrlInput = formData.get('image_url') as string;

    if (!name || isNaN(price) || !category_id) {
        return { error: 'Missing required fields' };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    let finalImageUrl = null;

    // Priority 1: User pasted a URL
    if (imageUrlInput && imageUrlInput.trim() !== '') {
        finalImageUrl = imageUrlInput.trim();
    }

    // Priority 2: User uploaded a file (overrides URL if both present, or handles file-only)
    if (imageFile && imageFile.size > 0) {
        const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const { data, error: uploadError } = await supabase
            .storage
            .from('menu-images')
            .upload(filename, imageFile);

        if (uploadError) {
            console.error("Upload error", uploadError);
            return { error: 'Image upload failed' };
        }

        const { data: { publicUrl } } = supabase.storage.from('menu-images').getPublicUrl(filename);
        finalImageUrl = publicUrl;
    }

    const { error } = await supabase.from('menu_items').insert({
        name,
        price,
        category_id,
        description,
        image_url: finalImageUrl,
        is_available: true,
        user_id: user.id
    });

    if (error) {
        console.error('Create item error:', error);
        return { error: `Failed to create item: ${error.message} (${error.code})` };
    }

    revalidatePath('/admin/menu');
    return { success: true };
}

export async function updateMenuItem(formData: FormData) {
    const supabase = await createClient();

    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const description = formData.get('description') as string;
    const imageFile = formData.get('image') as File;
    const imageUrlInput = formData.get('image_url') as string;

    if (!id || !name || isNaN(price)) {
        return { error: 'Missing required fields' };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // Prepare updates object
    const updates: any = {
        name,
        price,
        description,
    };

    // Handle Image Logic
    if (imageFile && imageFile.size > 0) {
        const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const { error: uploadError } = await supabase
            .storage
            .from('menu-images')
            .upload(filename, imageFile);

        if (uploadError) {
            console.error("Upload error", uploadError);
            return { error: 'Image upload failed' };
        }

        const { data: { publicUrl } } = supabase.storage.from('menu-images').getPublicUrl(filename);
        updates.image_url = publicUrl;
    } else if (imageUrlInput && imageUrlInput.trim() !== '') {
        // Only update if explicit URL provided (and no file uploaded)
        // If user wants to "remove" image, they might send empty string? 
        // For now, assume empty string means "keep existing" unless we add explicit "remove image" button.
        // But logic here says: if URL input is provided, use it.
        updates.image_url = imageUrlInput.trim();
    }

    // Tags and Pairings removed

    const { error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id); // Extra safety check

    if (error) {
        console.error('Error updating item:', error);
        return { error: `Failed to update item: ${error.message}` };
    }

    revalidatePath('/admin/menu');
    return { success: true };
}

export async function toggleAvailability(id: string, currentStatus: boolean) {
    const supabase = await createClient();
    await supabase.from('menu_items').update({ is_available: !currentStatus }).eq('id', id);
    revalidatePath('/admin/menu');
    return { success: true };
}


export async function deleteMenuItem(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Delete error:', error);
        return { error: `Failed to delete: ${error.message}` };
    }

    revalidatePath('/admin/menu');
    revalidatePath('/');
    return { success: true };
}

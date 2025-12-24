'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(orderId: string, status: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

    if (error) {
        return { error: 'Failed to update order' };
    }

    revalidatePath('/admin/orders');
    return { success: true };
}

export async function markOrderAsPaid(orderId: string) {
    const supabase = await createClient();

    // 1. Update Status to Paid
    const { data: order, error } = await supabase
        .from('orders')
        .update({ status: 'Paid' })
        .eq('id', orderId)
        .select()
        .single();

    if (error || !order) {
        console.error("Payment Error:", error);
        return { error: 'Failed to mark as paid: ' + (error?.message || 'Unknown error') };
    }

    // 2. Generate WhatsApp Link
    const message = `Hello ${order.customer_name}, thank you for dining at Rastaurent! 🍽️%0aYour bill of ₹${order.total_amount} has been paid via Cash/Card.%0aOrder ID: #${order.id.slice(0, 8)}.%0a%0aHave a great day!`;
    const whatsappUrl = `https://wa.me/${order.customer_phone}?text=${message}`;

    revalidatePath('/admin/orders');

    // Return order data so Client can send EmailJS
    return { success: true, whatsappUrl, order };
}

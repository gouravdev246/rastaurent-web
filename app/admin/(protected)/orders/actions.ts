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

    // 1. Fetch full order with items before updating
    const { data: fullOrder, error: fetchError } = await supabase
        .from('orders')
        .select(`
            *,
            tables(name),
            order_items(
                quantity,
                price_at_time,
                menu_items(name, price)
            )
        `)
        .eq('id', orderId)
        .single();

    if (fetchError || !fullOrder) {
        console.error("Fetch order error:", fetchError);
        return { error: 'Failed to fetch order details: ' + (fetchError?.message || 'Unknown error') };
    }

    // 2. Update Status to Paid
    const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'Paid' })
        .eq('id', orderId);

    if (updateError) {
        console.error("Payment Error:", updateError);
        return { error: 'Failed to mark as paid: ' + updateError.message };
    }

    // 3. Build itemized list for WhatsApp
    const itemsList = fullOrder.order_items.map((item: any) => {
        const itemName = item.menu_items?.name || 'Unknown Item';
        const itemPrice = item.price_at_time || item.menu_items?.price || 0;
        const subtotal = itemPrice * item.quantity;
        return `• ${item.quantity}x ${itemName} - ₹${subtotal}`;
    }).join('%0a');

    // 4. Generate detailed WhatsApp message
    const orderDate = new Date(fullOrder.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const message = encodeURIComponent(`🧾 *BILL RECEIPT*
━━━━━━━━━━━━━━━━━━
*Order ID:* #${fullOrder.id.slice(0, 8).toUpperCase()}
*Date:* ${orderDate}
*Table:* ${fullOrder.tables?.name || 'N/A'}

*Customer Details:*
Name: ${fullOrder.customer_name}
Phone: ${fullOrder.customer_phone || 'N/A'}
Email: ${fullOrder.customer_email || 'N/A'}

*Order Items:*
${decodeURIComponent(itemsList)}

━━━━━━━━━━━━━━━━━━
*TOTAL: ₹${fullOrder.total_amount}*
━━━━━━━━━━━━━━━━━━

Thank you for dining with us! 🍽️`);

    const whatsappUrl = fullOrder.customer_phone
        ? `https://wa.me/${fullOrder.customer_phone}?text=${message}`
        : null;

    revalidatePath('/admin/orders');

    // Return full order data so Client can send EmailJS with details
    return {
        success: true,
        whatsappUrl,
        order: {
            ...fullOrder,
            order_items: fullOrder.order_items
        }
    };
}

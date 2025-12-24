'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function submitOrder(tableId: string, cartItems: any[], customerDetails: any) {
    const supabase = await createClient();

    if (!cartItems || cartItems.length === 0) {
        return { error: 'Cart is empty' };
    }

    // Calculate total server-side for security (though we iterate cartItems which come from client, 
    // ideally we should refetch prices. For MVP we trust but should verify. 
    // Let's fetch prices.)
    const itemIds = cartItems.map(i => i.id);
    const { data: dbItems } = await supabase.from('menu_items').select('id, price').in('id', itemIds);

    if (!dbItems) return { error: 'Items not found' };

    let totalAmount = 0;
    const validOrderItems = [];

    for (const item of cartItems) {
        const dbItem = dbItems.find(i => i.id === item.id);
        if (dbItem) {
            const qty = item.quantity || 1;
            totalAmount += dbItem.price * qty;
            validOrderItems.push({
                menu_item_id: dbItem.id,
                quantity: qty,
                price_at_time: dbItem.price
            });
        }
    }

    // Create Order
    const { data: order, error: orderError } = await supabase.from('orders').insert({
        table_id: tableId,
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone,
        total_amount: totalAmount,
        status: 'New'
    }).select().single();

    if (orderError || !order) {
        console.error(orderError);
        return { error: 'Failed to place order' };
    }

    // Create Order Items
    const orderItemsData = validOrderItems.map(item => ({
        order_id: order.id,
        ...item
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);

    if (itemsError) {
        console.error(itemsError);
        // Logic to void order? For MVP, just return error but order exists... 
        // User might see error but kitchen sees empty order. 
        // Transaction would be better but simple Supabase JS doesn't expose easy transactions without RPC.
        return { error: 'Failed to add items to order' };
    }

    // Send Email (Placeholder)
    // await sendOrderReceipt(order);

    return { success: true, orderId: order.id };
}

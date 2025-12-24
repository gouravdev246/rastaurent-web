'use server';

import { createClient } from '@/utils/supabase/server';

export type CustomerStats = {
    name: string;
    phone: string;
    totalOrders: number;
    totalSpent: number;
    lastVisit: string;
};

export type DashboardStats = {
    revenue: {
        daily: number;
        weekly: number;
        monthly: number;
        total: number;
    };
    orders: {
        daily: number;
        weekly: number;
        monthly: number;
        total: number;
    };
    customers: CustomerStats[];
};

export async function getAnalyticsData(): Promise<DashboardStats> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // Fetch all orders for this user's tables
    // inner join tables to filter by user_id
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            id,
            total_amount,
            status,
            created_at,
            customer_name,
            customer_phone,
            tables!inner(user_id)
        `)
        .eq('tables.user_id', user.id)
        .eq('status', 'Paid') // Only count Paid orders for revenue? Maybe 'Completed' too depending on workflow
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Analytics Error:', error);
        return {
            revenue: { daily: 0, weekly: 0, monthly: 0, total: 0 },
            orders: { daily: 0, weekly: 0, monthly: 0, total: 0 },
            customers: []
        };
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Start of week (Sunday)
    // Fix: setDate mutates 'now', reset it first
    const today = new Date();
    const oneWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const stats = {
        revenue: { daily: 0, weekly: 0, monthly: 0, total: 0 },
        orders: { daily: 0, weekly: 0, monthly: 0, total: 0 },
        customers: [] as CustomerStats[]
    };

    const customerMap = new Map<string, CustomerStats>();

    orders?.forEach(order => {
        const orderDate = new Date(order.created_at);
        const amount = order.total_amount || 0;

        // Revenue & Count Aggregations
        stats.revenue.total += amount;
        stats.orders.total += 1;

        if (orderDate >= startOfDay) {
            stats.revenue.daily += amount;
            stats.orders.daily += 1;
        }

        if (orderDate >= oneWeekAgo) {
            stats.revenue.weekly += amount;
            stats.orders.weekly += 1;
        }

        if (orderDate >= startOfMonth) {
            stats.revenue.monthly += amount;
            stats.orders.monthly += 1;
        }

        // Customer Aggregation
        // Key by phone (more unique) or name if phone missing
        const key = order.customer_phone || order.customer_name;
        if (key) {
            if (!customerMap.has(key)) {
                customerMap.set(key, {
                    name: order.customer_name || 'Unknown',
                    phone: order.customer_phone || '',
                    totalOrders: 0,
                    totalSpent: 0,
                    lastVisit: order.created_at
                });
            }
            const cust = customerMap.get(key)!;
            cust.totalOrders += 1;
            cust.totalSpent += amount;
            // Update last visit if this order is newer (list is sorted desc, so first encounter is newest)
            if (new Date(order.created_at) > new Date(cust.lastVisit)) {
                cust.lastVisit = order.created_at;
            }
        }
    });

    stats.customers = Array.from(customerMap.values()).sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());

    return stats;
}

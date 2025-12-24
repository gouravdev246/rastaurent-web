'use client';

import emailjs from '@emailjs/browser';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { updateOrderStatus, markOrderAsPaid } from './actions';
import { Clock, CheckCircle, ChefHat, AlertCircle, Volume2, VolumeX, Printer } from 'lucide-react';

type Order = {
    id: string;
    table_id: string;
    tables: { name: string };
    customer_name: string;
    status: string;
    total_amount: number;
    created_at: string;
    order_items: {
        quantity: number;
        menu_items: { name: string }
    }[];
};

export default function KitchenBoard({ initialOrders }: { initialOrders: any[] }) {
    const [orders, setOrders] = useState<any[]>(initialOrders);
    const supabase = createClient();

    // State for Sound
    const [soundEnabled, setSoundEnabled] = useState(true);
    const soundEnabledRef = useRef(soundEnabled);
    const audioUrl = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

    // Keep Ref in sync with state
    useEffect(() => {
        soundEnabledRef.current = soundEnabled;
    }, [soundEnabled]);

    useEffect(() => {
        // Enable Realtime
        const channel = supabase
            .channel('orders-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                async (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const { data: newOrder } = await supabase
                            .from('orders')
                            .select('*, tables(name), order_items(quantity, menu_items(name))')
                            .eq('id', payload.new.id)
                            .single();

                        if (newOrder) {
                            setOrders(prev => [newOrder, ...prev]);
                            // Play sound if enabled
                            if (soundEnabledRef.current) {
                                new Audio(audioUrl).play().catch(e => console.log('Audio Autoplay Blocked:', e));
                            }
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        // Optimistic Update
        const previousOrders = [...orders];
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));

        const result = await updateOrderStatus(id, newStatus);

        if (result.error) {
            alert(result.error);
            // Rollback
            setOrders(previousOrders);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'New': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'Preparing': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'Completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            default: return 'bg-secondary/50 text-muted-foreground';
        }
    };

    // Group by status or just list sorted by time? 
    // Kanban board view ("New" | "Preparing" | "Completed") is best for Kitchen.
    const columns = ['New', 'Preparing', 'Completed'];

    const handlePayment = async (order: any) => {
        if (!confirm(`Mark order for ${order.customer_name} as PAID?`)) return;

        try {
            const res = await markOrderAsPaid(order.id);

            if (res.error) {
                alert(res.error);
                return;
            }

            if (res.success && res.whatsappUrl && res.order) {
                // 1. Send Email via EmailJS
                // Replace with your actual Service ID, Template ID, and Public Key
                // Use environment variables for EmailJS credentials
                const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
                const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
                const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

                const templateParams = {
                    to_name: res.order.customer_name,
                    to_email: res.order.customer_email,
                    // Mapping to user's "Tuition" template variables based on screenshot
                    amount: res.order.total_amount, // Template uses {{amount}}
                    month_for: new Date().toLocaleString('default', { month: 'long' }), // Template uses {{month_for}}
                    remarks: `Order ID: #${res.order.id.slice(0, 8)}. Thank you for dining with us!` // Template uses {{remarks}}
                };

                // We try-catch EmailJS so it doesn't block the UI
                try {
                    if (!res.order.customer_email) {
                        alert("Note: No email address found for this customer. Receipt skips email.");
                    } else {
                        await emailjs.send(serviceId, templateId, templateParams, publicKey);
                        alert('Receipt sent to email: ' + res.order.customer_email);
                    }
                } catch (emailErr: any) {
                    console.error("EmailJS Error:", emailErr);
                    alert("Failed to send Email Receipt: " + JSON.stringify(emailErr));
                }

                // 2. Open WhatsApp
                window.open(res.whatsappUrl, '_blank');

                // 3. Optimistic update
                setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Paid' } : o));
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            alert("An unexpected error occurred.");
        }
    };

    const handlePrint = (order: Order) => {
        const printWindow = window.open('', '', 'width=350,height=600');
        if (!printWindow) return;

        const html = `
            <html>
            <head>
                <title>Receipt #${order.id.slice(0, 8)}</title>
                <style>
                    body { font-family: 'Courier New', monospace; font-size: 12px; width: 300px; margin: 0; padding: 10px; color: black; }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .bold { font-weight: bold; }
                    .line { border-bottom: 1px dashed #000; margin: 10px 0; }
                    .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .header { margin-bottom: 15px; }
                    @media print {
                        @page { margin: 0; size: auto; }
                        body { margin: 10px; }
                    }
                </style>
            </head>
            <body>
                <div class="header text-center">
                    <div class="bold" style="font-size: 16px;">Rastaurent Kitchen</div>
                    <div>Table: ${order.tables?.name || 'N/A'}</div>
                    <div>${new Date(order.created_at).toLocaleString()}</div>
                    <div>Order: #${order.id.slice(0, 8)}</div>
                </div>
                
                <div class="line"></div>
                
                ${order.order_items.map(item => `
                    <div class="item">
                        <span>${item.quantity}x ${item.menu_items?.name}</span>
                    </div>
                `).join('')}
                
                <div class="line"></div>
                
                <div class="item bold">
                    <span>TOTAL</span>
                    <span>₹${order.total_amount?.toFixed(2)}</span>
                </div>
                
                <div class="line"></div>
                
                <div class="text-center">
                    <div>Customer: ${order.customer_name}</div>
                    ${order.status === 'Paid' ? '<div class="bold" style="margin-top:5px;">PAID</div>' : `<div style="margin-top:5px;">Status: ${order.status}</div>`}
                </div>

                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-160px)]">
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${soundEnabled ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-secondary text-muted-foreground border border-border'}`}
                >
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    {soundEnabled ? 'Sound On' : 'Sound Off'}
                </button>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
                {columns.map(status => (
                    // ... (column render logic remains same) ...
                    <div key={status} className="flex-1 min-w-[300px] flex flex-col bg-secondary/10 rounded-xl border border-border/50">
                        {/* ... content ... */}
                        <div className={`p-4 font-bold border-b border-border/50 flex justify-between uppercase tracking-wider text-sm ${status === 'New' ? 'text-blue-500' : status === 'Preparing' ? 'text-amber-500' : 'text-green-500'}`}>
                            {status}
                            <span className="bg-background/50 px-2 rounded-full text-xs flex items-center">{orders.filter(o => o.status === status).length}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {orders
                                .filter(o => o.status === status)
                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Newest first
                                .map(order => (
                                    <div key={order.id} className="bg-card border border-border rounded-lg p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                        {/* ... Order Card Content ... */}
                                        {/* Just replicating existing structure roughly to match replacement target */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold flex items-center gap-2">
                                                    <span className="bg-secondary px-2 py-0.5 rounded text-sm">{order.tables?.name || 'Unknown Table'}</span>
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-1">{new Date(order.created_at).toLocaleTimeString()}</p>
                                            </div>
                                            <div className="flex gap-2 items-start">
                                                <button
                                                    onClick={() => handlePrint(order)}
                                                    className="p-1.5 text-muted-foreground hover:text-foreground bg-secondary/50 rounded-md transition-colors"
                                                    title="Print Receipt"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                                {status === 'New' ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Are you sure you want to REJECT this order?')) {
                                                                    handleStatusUpdate(order.id, 'Rejected');
                                                                }
                                                            }}
                                                            className="bg-destructive/10 hover:bg-destructive/20 text-destructive px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(order.id, 'Preparing')}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                        >
                                                            Accept
                                                        </button>
                                                    </div>
                                                ) : status === 'Preparing' ? (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order.id, 'Completed')}
                                                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                    >
                                                        Finish
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePayment(order)}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                                    >
                                                        Settle Bill
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1 mb-3">
                                            {order.order_items?.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span>{item.menu_items?.name}</span>
                                                    <span className="font-mono text-muted-foreground">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-3 border-t border-border/50 text-xs text-muted-foreground flex justify-between items-center">
                                            <span>{order.customer_name}</span>
                                            <span className="font-mono text-base font-bold text-foreground">₹{order.total_amount}</span>
                                        </div>
                                    </div>
                                ))}
                            {orders.filter(o => o.status === status).length === 0 && (
                                <div className="text-center py-12 text-muted-foreground/50 text-sm italic">
                                    No orders
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

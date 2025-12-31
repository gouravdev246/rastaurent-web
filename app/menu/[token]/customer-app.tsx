'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    ShoppingBag,
    ChevronLeft,
    Plus,
    Minus,
    Search,
    Home,
    User,
    MapPin,
    Utensils,
    Clock,
    Star,
    Sparkles,
    MessageSquare,
    Bot,
    Sparkle,
    X
} from 'lucide-react';
import { submitOrder } from '../actions';
import { clsx } from 'clsx';

type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
};

type MenuItem = {
    id: string;
    category_id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    is_available: boolean;
    tags?: string | string[];
    pairings?: string | string[];
};

type Category = {
    id: string;
    name: string;
};

type Poster = {
    id: string;
    title: string;
    image_url: string;
    is_active: boolean;
    menu_item_id?: string;
};

export default function CustomerApp({ table, categories, items, posters, adminSettings }: { table: any; categories: Category[]; items: MenuItem[]; posters: Poster[]; adminSettings: any }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [view, setView] = useState<'home' | 'cart' | 'profile'>('home');
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '', email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // AI Assistant State
    const [isAIOpen, setIsAIOpen] = useState(false);
    const [aiQuery, setAIQuery] = useState('');
    const [highlightedItems, setHighlightedItems] = useState<string[]>([]);

    // Pairing State
    const [activePairingItem, setActivePairingItem] = useState<MenuItem | null>(null);

    // Loading State
    const [isLoading, setIsLoading] = useState(true);

    // Simulate Loading Screen
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    // Load Cart from Session Storage on Mount
    useEffect(() => {
        try {
            const saved = sessionStorage.getItem(`cart-${table.id}`);
            if (saved) {
                setCart(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load cart", e);
        }
    }, [table.id]);

    // Save Cart to Session Storage on Change
    useEffect(() => {
        try {
            sessionStorage.setItem(`cart-${table.id}`, JSON.stringify(cart));
        } catch (e) {
            console.error("Failed to save cart", e);
        }
    }, [cart, table.id]);

    // Group items by category for the "Home" vertical scroll or specific text search
    const filteredItems = useMemo(() => {
        let res = items.filter(i => i.is_available);

        if (selectedCategory !== 'all') {
            res = res.filter(i => i.category_id === selectedCategory);
        }

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            res = res.filter(i => i.name.toLowerCase().includes(lower) || i.description.toLowerCase().includes(lower));
        }

        return res;
    }, [items, selectedCategory, searchTerm]);

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-primary/5 flex flex-col items-center justify-center animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shadow-lg shadow-primary/30 animate-bounce-slow mb-6">
                    <Utensils size={48} className="text-white" />
                </div>
                <h1 className="text-3xl font-black text-foreground tracking-tight animate-pulse">
                    {adminSettings?.restaurant_name || 'Rastaurent'}
                </h1>
                <p className="text-muted-foreground mt-2 font-medium">Fine Dining Experience</p>
                <div className="mt-8 flex gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                </div>
            </div>
        );
    }

    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
        });

        // Smart Pairings Logic
        if (item.pairings) {
            try {
                const pairingIds = typeof item.pairings === 'string' ? JSON.parse(item.pairings) : item.pairings;
                if (Array.isArray(pairingIds) && pairingIds.length > 0) {
                    // Check if any of these pairings are NOT already in cart
                    const availablePairings = items.filter(i => pairingIds.includes(i.id) && !cart.some(c => c.id === i.id));
                    if (availablePairings.length > 0) {
                        setActivePairingItem(item);
                    }
                }
            } catch (e) { console.error("Pairing parse error", e); }
        }
    };

    const handleAISearch = (query: string) => {
        setAIQuery(query);
        if (!query.trim()) {
            setHighlightedItems([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const matches = items.filter(item => {
            const tags = item.tags ? (typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags) : [];
            const hasTag = Array.isArray(tags) && tags.some((t: string) => t.toLowerCase().includes(lowerQuery));
            const hasName = item.name.toLowerCase().includes(lowerQuery);
            const hasDesc = item.description.toLowerCase().includes(lowerQuery);
            return hasTag || hasName || hasDesc;
        });

        setHighlightedItems(matches.map(m => m.id));

        if (matches.length > 0) {
            // Scroll to first match
            const el = document.getElementById(`item-${matches[0].id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => {
            return prev.map(i => {
                if (i.id === id) {
                    return { ...i, quantity: Math.max(0, i.quantity + delta) };
                }
                return i;
            }).filter(i => i.quantity > 0);
        });
    };

    const handlePlaceOrder = async () => {
        setIsSubmitting(true);
        const res = await submitOrder(table.id, cart, customerDetails);
        if (res.success) {
            setCart([]);
            setView('success');
            setIsSubmitting(false); // Reset submitting state
        } else {
            console.error(res.error);
            alert(`Failed to place order: ${res.error || 'Unknown error'}`);
            setIsSubmitting(false);
        }
    };

    if (view === 'success') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center animate-in">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 text-green-500 animate-bounce">
                    <Clock size={48} />
                </div>
                <h1 className="text-3xl font-bold mb-2">Order Received!</h1>
                <p className="text-muted-foreground mb-8 text-lg">
                    Sit back and relax.<br />
                    Your food is being prepared.
                </p>
                <div className="bg-card w-full p-4 rounded-xl border border-border mb-8">
                    <p className="font-medium text-sm text-muted-foreground uppercase">Token ID</p>
                    <p className="text-4xl font-mono font-bold tracking-widest mt-2">#{Math.floor(Math.random() * 9000) + 1000}</p>
                </div>
                <button
                    onClick={() => {
                        setIsSubmitting(false); // Ensure state is clean
                        setView('home');
                    }}
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold"
                >
                    Order More
                </button>
            </div>
        )
    }

    if (view === 'cart') {
        return (
            <div className="min-h-screen bg-secondary/30 pb-48">
                <header className="p-4 bg-background sticky top-0 z-10 flex items-center gap-3 border-b border-border/50">
                    <button onClick={() => setView('home')} className="p-2 -ml-2 rounded-full hover:bg-secondary"><ChevronLeft /></button>
                    <h1 className="font-bold text-lg">Your Cart</h1>
                </header>

                <div className="p-4 space-y-6">
                    {/* Cart Items */}
                    <div className="space-y-4">
                        {cart.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Your cart is empty.</p>
                                <button onClick={() => setView('home')} className="text-primary font-bold mt-2">Browse Menu</button>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="bg-card p-4 rounded-2xl flex justify-between items-center shadow-sm">
                                    <div>
                                        <h4 className="font-bold">{item.name}</h4>
                                        <p className="text-primary font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-secondary rounded-xl p-1">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-background rounded-lg shadow-sm"><Minus size={14} /></button>
                                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-lg shadow-sm"><Plus size={14} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Checkout Details */}
                    {cart.length > 0 && (
                        <div className="animate-in slide-in-from-bottom-10 fade-in duration-500">
                            <h3 className="font-bold text-lg mb-3">Contact Details</h3>
                            <div className="bg-card p-4 rounded-2xl space-y-3 shadow-sm">
                                <input
                                    className="w-full bg-secondary/50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    placeholder="Name"
                                    value={customerDetails.name}
                                    onChange={e => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                                />
                                <input
                                    className="w-full bg-secondary/50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    placeholder="Phone Number"
                                    type="tel"
                                    value={customerDetails.phone}
                                    onChange={e => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                                />
                                <input
                                    className="w-full bg-secondary/50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    placeholder="Email Address"
                                    type="email"
                                    value={customerDetails.email}
                                    onChange={e => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>

                            {/* Spacer to prevent fixed footer overlap */}
                            <div className="h-40" />

                            <div className="mt-8 bg-card p-4 rounded-t-3xl border-t border-border fixed bottom-0 left-0 right-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-muted-foreground">Total Amount</span>
                                    <span className="text-2xl font-bold text-foreground">₹{cartTotal.toFixed(2)}</span>
                                </div>
                                <button
                                    disabled={isSubmitting || !customerDetails.name || !customerDetails.phone}
                                    onClick={handlePlaceOrder}
                                    className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:shadow-none"
                                >
                                    {isSubmitting ? 'Processing...' : 'Place Order'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // HOME VIEW
    return (
        <div className="min-h-screen bg-secondary/30 pb-40 font-sans">
            {/* Top Header */}
            <div className="bg-background sticky top-0 z-10 p-4 pb-2 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full text-primary">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Location</p>
                            <h2 className="font-bold flex items-center gap-1">
                                {table?.name || 'Table 1'} <span className="text-muted-foreground">▾</span>
                            </h2>
                        </div>
                    </div>
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center border border-border">
                        <User size={20} className="text-muted-foreground" />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                    <input
                        className="w-full bg-secondary/50 border-none rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-muted-foreground/60"
                        placeholder="Search for food..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="p-4 pt-2 space-y-6">

                {/* Promo Posters Carousel */}
                {!searchTerm && posters.length > 0 && (
                    <div>
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            🔥 Offers
                        </h3>
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x no-scrollbar">
                            {posters.map((poster: Poster) => (
                                <button
                                    key={poster.id}
                                    onClick={() => {
                                        if (poster.menu_item_id) {
                                            // Find category for this item
                                            const item = items.find(i => i.id === poster.menu_item_id);
                                            if (item) {
                                                // Select category first to ensure it's visible
                                                setSelectedCategory(item.category_id);
                                                // Slight delay to allow render, then scroll
                                                setTimeout(() => {
                                                    const el = document.getElementById(`item-${poster.menu_item_id}`);
                                                    if (el) {
                                                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                        el.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
                                                        setTimeout(() => el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2'), 2000);
                                                    }
                                                }, 100);
                                            }
                                        }
                                    }}
                                    className="relative overflow-hidden rounded-xl shadow-sm min-w-[70%] max-h-28 snap-center flex-shrink-0 text-left transition-transform active:scale-[0.98]"
                                >
                                    <img
                                        src={poster.image_url}
                                        alt={poster.title}
                                        className="w-full h-28 object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Categories */}
                {!searchTerm && (
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-lg">Categories</h3>
                            <button onClick={() => setSelectedCategory('all')} className="text-primary text-xs font-bold">See All</button>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={clsx(
                                    "flex flex-col items-center gap-2 min-w-[70px] snap-start transition-all",
                                    selectedCategory === 'all' ? "opacity-100 scale-105" : "opacity-60 hover:opacity-100"
                                )}
                            >
                                <div className={clsx(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-colors",
                                    selectedCategory === 'all' ? "bg-primary text-white" : "bg-card border border-border"
                                )}>
                                    🍽️
                                </div>
                                <span className={clsx("text-xs font-medium", selectedCategory === 'all' ? "text-primary" : "text-muted-foreground")}>All</span>
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={clsx(
                                        "flex flex-col items-center gap-2 min-w-[70px] snap-start transition-all",
                                        selectedCategory === cat.id ? "opacity-100 scale-105" : "opacity-60 hover:opacity-100"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-colors",
                                        selectedCategory === cat.id ? "bg-primary text-white" : "bg-card border border-border"
                                    )}>
                                        {/* Simple hash for emoji or icon based on name, otherwise first letter */}
                                        {cat.name.toLowerCase().includes('burger') ? '🍔' :
                                            cat.name.toLowerCase().includes('pizza') ? '🍕' :
                                                cat.name.toLowerCase().includes('drink') ? '🥤' :
                                                    cat.name.toLowerCase().includes('dessert') ? '🍰' : '🍱'}
                                    </div>
                                    <span className={clsx("text-xs font-medium truncate w-full text-center", selectedCategory === cat.id ? "text-primary" : "text-muted-foreground")}>{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Popular / Items Grid */}
                <div>
                    <h3 className="font-bold text-lg mb-4">{searchTerm ? 'Search Results' : 'Popular Items'}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {filteredItems.map(item => (
                            <div
                                key={item.id}
                                id={`item-${item.id}`}
                                onClick={() => setSelectedItem(item)}
                                className={clsx(
                                    "bg-card rounded-2xl p-3 shadow-sm border border-border/50 group active:scale-[0.98] transition-all scroll-mt-32 relative cursor-pointer",
                                    highlightedItems.includes(item.id) && "ring-2 ring-primary ring-offset-2 shadow-[0_0_20px_rgba(var(--primary),0.3)] scale-[1.02]"
                                )}
                            >
                                {highlightedItems.includes(item.id) && (
                                    <div className="absolute -top-2 -right-2 bg-primary text-white p-1 rounded-full z-10 animate-bounce">
                                        <Sparkles size={12} />
                                    </div>
                                )}
                                <div className="aspect-square bg-secondary rounded-xl mb-3 overflow-hidden relative">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                            <Utensils size={32} />
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(item);
                                        }}
                                        className="absolute bottom-2 right-2 bg-white text-primary rounded-full p-2 shadow-lg active:scale-90 transition-transform"
                                    >
                                        <Plus size={16} strokeWidth={3} />
                                    </button>
                                </div>
                                <h4 className="font-bold text-sm truncate">{item.name}</h4>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">4.5 <Star size={10} className="fill-orange-400 text-orange-400" /></span>
                                    <span className="font-bold text-primary">₹{item.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Summary Bar */}
            {cartCount > 0 && (
                <div className="fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <button
                        onClick={() => setView('cart')}
                        className="w-full bg-primary text-primary-foreground p-4 rounded-2xl shadow-lg flex justify-between items-center active:scale-[0.98] transition-transform"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                {cartCount}
                            </div>
                            <span className="font-bold text-sm">View Cart</span>
                        </div>
                        <span className="font-bold text-lg">₹{cartTotal.toFixed(2)}</span>
                    </button>
                </div>
            )}

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 px-6 pb-6 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                <NavButton active={view === 'home'} icon={<Home size={24} />} label="Home" onClick={() => setView('home')} />
                <div className="relative">
                    <button
                        onClick={() => setView('cart')}
                        className="bg-primary text-primary-foreground p-4 rounded-full shadow-lg shadow-primary/30 -mt-8 hover:scale-105 transition-transform"
                    >
                        <ShoppingBag size={24} />
                    </button>
                    {cartCount > 0 && (
                        <span className="absolute top-[-40px] right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-background">
                            {cartCount}
                        </span>
                    )}
                </div>
                <NavButton active={view === 'profile'} icon={<User size={24} />} label="Profile" onClick={() => { }} />
            </nav>

            {/* AI Assistant Drawer */}
            {isAIOpen && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-20 duration-500">
                        <div className="bg-primary p-6 text-white relative">
                            <button onClick={() => setIsAIOpen(false)} className="absolute right-6 top-6 bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <Bot size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">Menu Assistant</h3>
                                    <p className="text-white/70 text-sm">Find your perfect dish</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <p className="text-sm font-medium text-muted-foreground">Try asking for something like:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Spicy', 'Vegan', 'Desserts', 'Popular', 'Light Meal'].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => handleAISearch(tag)}
                                            className="px-4 py-2 bg-secondary/50 hover:bg-primary/10 hover:text-primary rounded-full text-sm transition-colors border border-border"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                                <input
                                    autoFocus
                                    className="w-full bg-secondary/30 border-2 border-transparent focus:border-primary/30 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium"
                                    placeholder="Mood? (e.g. Find me something spicy)"
                                    value={aiQuery}
                                    onChange={(e) => handleAISearch(e.target.value)}
                                />
                            </div>

                            {highlightedItems.length > 0 && (
                                <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
                                    <Sparkle size={16} />
                                    <span>Found {highlightedItems.length} items for you!</span>
                                </div>
                            )}

                            <button
                                onClick={() => setIsAIOpen(false)}
                                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                            >
                                View Results
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Item Details Modal */}
            {
                selectedItem && (
                    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-background w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-[2rem] sm:rounded-3xl shadow-2xl overflow-y-auto animate-in slide-in-from-bottom-20 duration-500 relative flex flex-col">

                            {/* Image Header */}
                            <div className="relative h-64 sm:h-72 w-full shrink-0">
                                {selectedItem.image_url ? (
                                    <img
                                        src={selectedItem.image_url}
                                        alt={selectedItem.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground/30">
                                        <Utensils size={64} />
                                    </div>
                                )}
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/70 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
                            </div>

                            {/* Content */}
                            <div className="p-6 pt-2 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-2xl font-bold leading-tight">{selectedItem.name}</h2>
                                    <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-lg whitespace-nowrap">
                                        ₹{selectedItem.price}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 mb-6">
                                    <div className="flex gap-0.5 text-orange-400">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} size={14} className="fill-current" />
                                        ))}
                                    </div>
                                    <span className="text-sm text-muted-foreground">(4.5) • 120 reviews</span>
                                </div>

                                <p className="text-muted-foreground leading-relaxed text-lg mb-8 flex-1">
                                    {selectedItem.description || "No description available for this item."}
                                </p>

                                <button
                                    onClick={() => {
                                        addToCart(selectedItem);
                                        setSelectedItem(null);
                                    }}
                                    className="w-full bg-primary text-primary-foreground text-lg font-bold py-4 rounded-2xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={24} />
                                    Add to Order
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Smart Pairing Popup (Glassmorphism) */}
            {
                activePairingItem && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white/70 backdrop-blur-xl border border-white/40 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center relative animate-in zoom-in-95 duration-500">
                            <button onClick={() => setActivePairingItem(null)} className="absolute right-6 top-6 text-muted-foreground hover:text-foreground">
                                <X size={20} />
                            </button>

                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                <Star size={32} className="fill-primary/20" />
                            </div>

                            <h3 className="text-xl font-bold mb-2">Perfect Pairing!</h3>
                            <p className="text-muted-foreground text-sm mb-6">
                                Since you added <span className="text-foreground font-bold">{activePairingItem.name}</span>, would you like to add these to your meal?
                            </p>

                            <div className="space-y-3 mb-8">
                                {items
                                    .filter(i => {
                                        const pIds = typeof activePairingItem.pairings === 'string' ? JSON.parse(activePairingItem.pairings) : activePairingItem.pairings;
                                        return pIds.includes(i.id) && !cart.some(c => c.id === i.id);
                                    })
                                    .map(pairing => (
                                        <div key={pairing.id} className="bg-white/40 rounded-2xl p-3 flex items-center justify-between border border-white/40">
                                            <div className="flex items-center gap-3">
                                                {pairing.image_url ? (
                                                    <img src={pairing.image_url} alt={pairing.name} className="w-12 h-12 rounded-xl object-cover" />
                                                ) : (
                                                    <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center"><Utensils size={20} /></div>
                                                )}
                                                <div className="text-left">
                                                    <p className="font-bold text-sm leading-tight">{pairing.name}</p>
                                                    <p className="text-primary font-bold text-xs">₹{pairing.price}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    addToCart(pairing);
                                                    setActivePairingItem(null);
                                                }}
                                                className="bg-primary text-primary-foreground p-2 rounded-xl shadow-md"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    ))}
                            </div>

                            <button
                                onClick={() => setActivePairingItem(null)}
                                className="text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
                            >
                                No thanks, maybe later
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Floating Assistant Button */}
            {
                !isAIOpen && adminSettings?.is_ai_enabled && (
                    <button
                        onClick={() => setIsAIOpen(true)}
                        className="fixed left-1/2 -translate-x-1/2 bottom-28 w-14 h-14 bg-primary text-primary-foreground rounded-2xl shadow-2xl flex items-center justify-center animate-bounce-slow z-40 group hover:scale-110 active:scale-95 transition-all"
                    >
                        <div className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border-2 border-white animate-ping"></div>
                        <Bot size={28} />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap border border-primary/20">Ask Assistant</span>
                    </button>
                )
            }
        </div >
    );
}

function NavButton({ active, icon, label, onClick }: any) {
    return (
        <button onClick={onClick} className={clsx("flex flex-col items-center gap-1 p-2 transition-colors", active ? "text-primary" : "text-muted-foreground/60 hover:text-foreground")}>
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    )
}

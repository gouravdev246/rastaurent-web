'use client';

import { useState } from 'react';
import { createCategory, createMenuItem, updateMenuItem, deleteCategory, deleteMenuItem, toggleAvailability } from './actions';
import { Plus, Trash2, Image as ImageIcon, Pencil, X, Upload, Link as LinkIcon, UtensilsCrossed } from 'lucide-react';

export default function MenuManager({ categories, menuItems }: { categories: any[], menuItems: any[] }) {
    const [activeCategory, setActiveCategory] = useState<string | null>(categories[0]?.id || null);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [isCreatingItem, setIsCreatingItem] = useState(false);

    const filteredItems = menuItems.filter(item => item.category_id === activeCategory);

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col lg:flex-row gap-8 min-h-[500px]">

                {/* Categories Sidebar */}
                <div className="w-full lg:w-64 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg">Categories</h2>
                        <button
                            onClick={() => setIsAddingCategory(!isAddingCategory)}
                            className="p-1 hover:bg-secondary rounded-md"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {isAddingCategory && (
                        <form action={async (fd) => {
                            await createCategory(fd);
                            setIsAddingCategory(false);
                        }} className="flex gap-2">
                            <input name="name" autoFocus placeholder="New Category" className="flex-1 px-3 py-2 rounded-md bg-secondary border border-border text-sm" />
                            <button className="bg-primary text-primary-foreground px-3 rounded-md text-xs">Add</button>
                        </form>
                    )}

                    <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
                        {categories.map(cat => (
                            <div key={cat.id} className="group flex items-center gap-2">
                                <button
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex-1 text-left px-4 py-3 rounded-xl transition-all whitespace-nowrap lg:whitespace-normal ${activeCategory === cat.id ? 'bg-primary text-primary-foreground font-medium shadow-md' : 'bg-card hover:bg-secondary text-muted-foreground'}`}
                                >
                                    {cat.name}
                                </button>
                                <button onClick={() => confirm('Delete category?') && deleteCategory(cat.id)} className="hidden lg:block opacity-0 group-hover:opacity-100 p-2 text-destructive hover:bg-destructive/10 rounded-full transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {categories.length === 0 && <div className="text-sm text-muted-foreground">No categories.</div>}
                    </div>
                </div>

                {/* Items Grid */}
                <div className="flex-1 bg-secondary/10 rounded-2xl p-4 md:p-6 border border-border/50">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-xl md:text-2xl">
                            {categories.find(c => c.id === activeCategory)?.name || 'Select Category'}
                        </h2>
                        {activeCategory && (
                            <button
                                onClick={() => setIsCreatingItem(true)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 shadow-lg shadow-primary/20"
                            >
                                <Plus size={18} /> Add Item
                            </button>
                        )}
                    </div>

                    {/* Item Modal (Create or Edit) */}
                    {(isCreatingItem || editingItem) && (
                        <ItemModal
                            categoryId={activeCategory!}
                            item={editingItem}
                            onClose={() => {
                                setIsCreatingItem(false);
                                setEditingItem(null);
                            }}
                        />
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredItems.map(item => (
                            <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all group relative">
                                {/* Image Area */}
                                <div className="aspect-video bg-secondary relative overflow-hidden">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            <ImageIcon size={32} opacity={0.2} />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <button
                                            onClick={() => toggleAvailability(item.id, item.is_available)}
                                            className={`px-2 py-1 rounded-full text-xs font-bold backdrop-blur-md ${item.is_available ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                                        >
                                            {item.is_available ? 'In Stock' : 'Sold Out'}
                                        </button>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold truncate pr-2">{item.name}</h3>
                                        <span className="font-mono text-primary font-semibold text-sm">₹{item.price}</span>
                                    </div>
                                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 h-10 mb-4 items-center">{item.description}</p>

                                    <div className="flex justify-end pt-2 border-t border-border/50 mt-auto gap-2">
                                        <button
                                            onClick={() => setEditingItem(item)}
                                            className="text-muted-foreground hover:text-primary p-1 rounded transition-colors"
                                            title="Edit Item"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => confirm('Delete item?') && deleteMenuItem(item.id)}
                                            className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                                            title="Delete Item"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {activeCategory && filteredItems.length === 0 && !isCreatingItem && (
                            <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
                                No items in this category.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ItemModal({ categoryId, item, onClose }: { categoryId: string, item?: any, onClose: () => void }) {
    const [imageMode, setImageMode] = useState<'upload' | 'url'>(item?.image_url ? 'url' : 'upload');

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col overflow-hidden">
                {/* Fixed Header */}
                <div className="flex justify-between items-center p-6 border-b border-border bg-card">
                    <h3 className="font-bold text-xl">{item ? 'Edit Item' : 'New Item'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <form id="item-form" action={async (fd) => {
                        if (item) {
                            fd.append('id', item.id);
                            await updateMenuItem(fd);
                        } else {
                            await createMenuItem(fd);
                        }
                        onClose();
                    }} className="space-y-4">
                        <input type="hidden" name="category_id" value={categoryId} />
                        <input type="hidden" name="tags" value={item?.tags ? (typeof item.tags === 'string' ? item.tags : JSON.stringify(item.tags)) : '[]'} />
                        <input type="hidden" name="pairings" value={item?.pairings ? (typeof item.pairings === 'string' ? item.pairings : JSON.stringify(item.pairings)) : '[]'} />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium ml-1">Name</label>
                                <input
                                    name="name"
                                    defaultValue={item?.name}
                                    required
                                    placeholder="Burger"
                                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium ml-1">Price</label>
                                <input
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    defaultValue={item?.price}
                                    required
                                    placeholder="12.99"
                                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium ml-1">Description</label>
                            <textarea
                                name="description"
                                defaultValue={item?.description}
                                placeholder="Juicy beef patty..."
                                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium ml-1">Tags (comma separated)</label>
                                <input
                                    name="tags_input"
                                    defaultValue={item?.tags ? (typeof item.tags === 'string' ? JSON.parse(item.tags).join(', ') : item.tags.join(', ')) : ''}
                                    placeholder="spicy, vegan, popular"
                                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20 text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium ml-1">Pairing IDs (comma separated)</label>
                                <input
                                    name="pairings_input"
                                    defaultValue={item?.pairings ? (typeof item.pairings === 'string' ? JSON.parse(item.pairings).join(', ') : item.pairings.join(', ')) : ''}
                                    placeholder="ID1, ID2"
                                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium ml-1">Image</label>
                            <div className="flex gap-2 mb-2">
                                <button
                                    type="button"
                                    onClick={() => setImageMode('upload')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm border ${imageMode === 'upload' ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary border-transparent text-muted-foreground'}`}
                                >
                                    <Upload size={16} /> Upload
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageMode('url')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm border ${imageMode === 'url' ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary border-transparent text-muted-foreground'}`}
                                >
                                    <LinkIcon size={16} /> URL Link
                                </button>
                            </div>

                            {imageMode === 'upload' ? (
                                <input
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                                />
                            ) : (
                                <input
                                    name="image_url"
                                    type="url"
                                    defaultValue={item?.image_url}
                                    placeholder="https://example.com/food.jpg"
                                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-primary/20"
                                />
                            )}
                        </div>
                    </form>
                </div>

                {/* Fixed Footer */}
                <div className="p-6 border-t border-border bg-secondary/10 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-3 rounded-xl font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="item-form"
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                    >
                        {item ? 'Save' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
}

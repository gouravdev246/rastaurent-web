'use client';

import { useState, useRef } from 'react';
import { createPoster, deletePoster, togglePosterStatus, uploadPosterImage, updatePoster } from './actions';
import { Plus, Trash2, Eye, EyeOff, Upload, ImageIcon, X, Pencil, Link as LinkIcon } from 'lucide-react';

type Poster = {
    id: string;
    title: string;
    image_url: string;
    is_active: boolean;
    sort_order: number;
    menu_item_id?: string | null;
    menu_item?: { id: string, name: string } | null;
};

type MenuItem = {
    id: string;
    name: string;
};

export default function PostersManager({ initialPosters, menuItems }: { initialPosters: Poster[], menuItems: MenuItem[] }) {
    const [posters, setPosters] = useState<Poster[]>(initialPosters);
    const [isCreating, setIsCreating] = useState(false);
    const [editingPoster, setEditingPoster] = useState<Poster | null>(null);
    const [loading, setLoading] = useState(false);

    const handleToggle = async (poster: Poster) => {
        setLoading(true);
        await togglePosterStatus(poster.id, !poster.is_active);
        setPosters(prev => prev.map(p => p.id === poster.id ? { ...p, is_active: !p.is_active } : p));
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this poster?')) return;
        setLoading(true);
        await deletePoster(id);
        setPosters(prev => prev.filter(p => p.id !== id));
        setLoading(false);
    };

    const handleCreate = async (title: string, imageUrl: string, menuItemId: string | null) => {
        setLoading(true);
        const result = await createPoster(title, imageUrl, menuItemId);
        if (result.success) {
            window.location.reload();
        }
        setIsCreating(false);
        setLoading(false);
    };

    const handleEdit = async (id: string, title: string, imageUrl: string, menuItemId: string | null) => {
        setLoading(true);
        const result = await updatePoster(id, title, imageUrl, menuItemId);
        if (result.success) {
            // Optimistic update - in real app might want to reload or fetch fresh data to get relational data
            window.location.reload();
        }
        setEditingPoster(null);
        setLoading(false);
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Add Button */}
            <button
                onClick={() => setIsCreating(true)}
                className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
                <Plus className="w-5 h-5" />
                Add New Poster
            </button>

            {/* Create Modal */}
            {isCreating && (
                <PosterModal
                    menuItems={menuItems}
                    onSave={handleCreate}
                    onClose={() => setIsCreating(false)}
                    loading={loading}
                />
            )}

            {/* Edit Modal */}
            {editingPoster && (
                <PosterModal
                    menuItems={menuItems}
                    poster={editingPoster}
                    onSave={(title, imageUrl, menuItemId) => handleEdit(editingPoster.id, title, imageUrl, menuItemId)}
                    onClose={() => setEditingPoster(null)}
                    loading={loading}
                />
            )}

            {/* Posters Grid */}
            {posters.length === 0 ? (
                <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
                    <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No posters yet. Add your first promotional poster!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posters.map(poster => (
                        <div
                            key={poster.id}
                            className={`bg-card rounded-2xl border border-border overflow-hidden transition-opacity ${!poster.is_active ? 'opacity-60' : ''}`}
                        >
                            {/* Poster Image */}
                            <div className="aspect-[16/9] relative bg-secondary">
                                {poster.image_url ? (
                                    <img
                                        src={poster.image_url}
                                        alt={poster.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                                    </div>
                                )}
                                {!poster.is_active && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                                            Hidden
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Poster Info & Actions */}
                            <div className="p-4">
                                <h3 className="font-bold truncate mb-1">{poster.title}</h3>
                                {poster.menu_item && (
                                    <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-3 bg-primary/10 w-fit px-2 py-1 rounded-lg">
                                        <LinkIcon className="w-3 h-3" />
                                        Linked to: {poster.menu_item.name}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                    <button
                                        onClick={() => handleToggle(poster)}
                                        className={`p-2 rounded-lg transition-colors ${poster.is_active ? 'bg-green-500/10 text-green-600' : 'bg-secondary text-muted-foreground'}`}
                                        title={poster.is_active ? 'Hide poster' : 'Show poster'}
                                    >
                                        {poster.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => setEditingPoster(poster)}
                                        className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                        title="Edit"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(poster.id)}
                                        className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function PosterModal({
    poster,
    menuItems,
    onSave,
    onClose,
    loading
}: {
    poster?: Poster;
    menuItems: MenuItem[];
    onSave: (title: string, imageUrl: string, menuItemId: string | null) => void;
    onClose: () => void;
    loading: boolean;
}) {
    const [title, setTitle] = useState(poster?.title || '');
    const [imageUrl, setImageUrl] = useState(poster?.image_url || '');
    const [menuItemId, setMenuItemId] = useState<string>(poster?.menu_item_id || '');
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadPosterImage(formData);
        if (result.url) {
            setImageUrl(result.url);
        } else if (result.error) {
            alert(result.error);
        }
        setUploading(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageUrl) {
            alert('Please upload an image for the poster.');
            return;
        }
        onSave(title, imageUrl, menuItemId || null);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border border-border w-full max-w-lg animate-in max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-bold">{poster ? 'Edit Poster' : 'New Poster'}</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <form id="poster-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                                placeholder="Summer Special Offer"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Likned Food Item (Optional)</label>
                            <select
                                value={menuItemId}
                                onChange={(e) => setMenuItemId(e.target.value)}
                                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                            >
                                <option value="">-- No linked item --</option>
                                {menuItems.map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground mt-1">
                                Clicking this poster will take the customer to this item.
                            </p>
                        </div>

                        {/* Image Upload Zone */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Poster Image</label>
                            <div
                                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-border'
                                    }`}
                                onDrop={handleDrop}
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={() => setDragActive(false)}
                            >
                                {imageUrl ? (
                                    <div className="relative">
                                        <img
                                            src={imageUrl}
                                            alt="Preview"
                                            className="max-h-48 mx-auto rounded-lg object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setImageUrl('')}
                                            className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full hover:bg-destructive/80"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : uploading ? (
                                    <div className="py-8">
                                        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                                        <p className="text-sm text-muted-foreground">Uploading...</p>
                                    </div>
                                ) : (
                                    <div className="py-6">
                                        <Upload className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Drag and drop an image here, or
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-primary font-medium hover:underline"
                                        >
                                            browse to upload
                                        </button>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                className="hidden"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                Recommended: 16:9 aspect ratio, max 2MB
                            </p>
                        </div>

                        {/* Or use URL */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Or paste image URL</label>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                                placeholder="https://example.com/poster.jpg"
                            />
                        </div>
                    </form>
                </div>

                {/* Fixed Footer */}
                <div className="p-6 border-t border-border flex gap-3 bg-secondary/10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-secondary text-foreground px-4 py-3 rounded-xl font-medium hover:bg-secondary/80 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="poster-form"
                        disabled={loading || uploading || !imageUrl}
                        className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                        {loading ? 'Saving...' : (poster ? 'Save Changes' : 'Create Poster')}
                    </button>
                </div>
            </div>
        </div>
    );
}

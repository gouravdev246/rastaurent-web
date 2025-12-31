'use client';

import { useState } from 'react';
import { updateRestaurantName } from './actions';
import { Loader2, Store } from 'lucide-react';

interface RestaurantSettingsProps {
    initialName: string;
}

export default function RestaurantSettings({ initialName }: RestaurantSettingsProps) {
    const [name, setName] = useState(initialName);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = async () => {
        setIsLoading(true);
        setMessage('');

        const res = await updateRestaurantName(name);

        if (res.error) {
            setMessage(`Error: ${res.error}`);
        } else {
            setMessage('Saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        }

        setIsLoading(false);
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Store className="text-primary" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Restaurant Identity</h2>
                    <p className="text-muted-foreground text-sm">
                        Set the name displayed on the loading screen and headers.
                    </p>
                </div>
            </div>

            <div className="space-y-4 max-w-md">
                <div>
                    <label className="block text-sm font-medium mb-1.5">Restaurant Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. The Gourmet Kitchen"
                        className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={isLoading || !name.trim()}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {isLoading && <Loader2 size={16} className="animate-spin" />}
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    {message && (
                        <span className={`text-sm ${message.includes('Error') ? 'text-destructive' : 'text-green-600'} animate-in fade-in`}>
                            {message}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { updateAISetting } from './actions';
import { Bot, Sparkles } from 'lucide-react';

export function AIToggle({ initialStatus }: { initialStatus: boolean }) {
    const [isEnabled, setIsEnabled] = useState(initialStatus);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        const newStatus = !isEnabled;
        const res = await updateAISetting(newStatus);

        if (res.success) {
            setIsEnabled(newStatus);
        } else {
            alert(res.error || 'Failed to update setting');
        }
        setLoading(false);
    };

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-colors ${isEnabled ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                        <Bot size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold">AI Menu Assistant</h3>
                        <p className="text-xs text-muted-foreground">Smart dish finder for customers</p>
                    </div>
                </div>
                <button
                    disabled={loading}
                    onClick={handleToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 ${isEnabled ? 'bg-primary' : 'bg-secondary'}`}
                >
                    <span
                        className={`${isEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                </button>
            </div>

            <div className={`text-sm py-2 px-3 rounded-lg border flex items-center gap-2 transition-all ${isEnabled ? 'bg-green-500/5 text-green-600 border-green-500/10' : 'bg-red-500/5 text-red-600 border-red-500/10 opacity-70'}`}>
                <Sparkles size={14} className={isEnabled ? 'animate-pulse' : ''} />
                {isEnabled ? 'Assistant is active on your menu' : 'Assistant is currently disabled'}
            </div>
        </div>
    );
}

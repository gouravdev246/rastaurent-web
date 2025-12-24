'use client';

import { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { createTable, deleteTable } from './actions';
import { Trash2, Printer, Plus, QrCode } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            disabled={pending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
            <Plus size={16} />
            {pending ? 'Adding...' : 'Add Table'}
        </button>
    );
}

export default function TableManager({ tables }: { tables: any[] }) {
    const [selectedQr, setSelectedQr] = useState<any>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = printRef.current;
        if (printContent) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // Reload to restore state/listeners
        }
    };

    return (
        <div className="p-4 md:p-8">
            {/* Add Table Form */}
            <div className="mb-6 md:mb-8 p-4 md:p-6 bg-card border border-border rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plus className="text-primary" size={20} /> Add New Table
                </h2>
                <form action={async (formData) => {
                    await createTable(formData);
                }} className="flex flex-col sm:flex-row gap-4 sm:items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1.5 ml-1">Table Name</label>
                        <input
                            name="name"
                            required
                            placeholder="e.g. Table 5"
                            className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                        />
                    </div>
                    <SubmitButton />
                </form>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {tables.map((table) => (
                    <div key={table.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all">
                        <div className="p-4 border-b border-border flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg">{table.name}</h3>
                                <span className="text-xs text-muted-foreground font-mono">{table.token.slice(0, 8)}...</span>
                            </div>
                            <button
                                onClick={() => deleteTable(table.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                title="Delete Table"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="p-6 flex flex-col items-center justify-center bg-white/5 gap-4">
                            {/* Small Preview QR */}
                            <div className="bg-white p-2 rounded-lg">
                                <QRCode value={table.qr_code_url} size={100} />
                            </div>

                            <div className="flex gap-2 w-full">
                                <button
                                    onClick={() => setSelectedQr(table)}
                                    className="flex-1 flex items-center justify-center gap-2 text-sm bg-secondary hover:bg-secondary/80 py-2 rounded-lg transition-colors"
                                >
                                    <QrCode size={16} /> View & Print
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {tables.length === 0 && (
                    <div className="col-span-full p-12 text-center text-muted-foreground bg-secondary/10 rounded-xl border-dashed border-2 border-border">
                        No tables added yet. Add one above to get started.
                    </div>
                )}
            </div>

            {/* QR Modal / Print View */}
            {selectedQr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-background rounded-2xl max-w-sm w-full overflow-hidden relative border border-border max-h-[90vh] overflow-y-auto shadow-2xl">
                        <button
                            onClick={() => setSelectedQr(null)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                        >
                            ✕
                        </button>

                        <div ref={printRef} className="p-8 flex flex-col items-center justify-center bg-white text-black">
                            <h2 className="text-2xl font-bold mb-2 text-black">Scan to Order</h2>
                            <p className="text-sm text-gray-500 mb-6 uppercase tracking-widest">{selectedQr.name}</p>
                            <QRCode value={selectedQr.qr_code_url} size={250} />
                            <p className="mt-6 text-xs text-gray-400 font-mono">rastaurent.app</p>
                        </div>

                        <div className="p-4 border-t border-border bg-card flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedQr(null)}
                                className="px-4 py-2 text-sm hover:bg-secondary rounded-lg"
                            >
                                Close
                            </button>
                            <button
                                onClick={handlePrint}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90"
                            >
                                <Printer size={16} /> Print QR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

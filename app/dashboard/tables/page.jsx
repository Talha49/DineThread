"use client";

import { useState, useEffect, useCallback } from "react";
import { useRestaurantStore } from "@/hooks/use-restaurant-store";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Utensils, Plus, Trash2, Power, Loader2 } from "lucide-react";

export default function TablesPage() {
    const { restaurant } = useRestaurantStore();
    const [tables, setTables] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchTables = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/tables");
            if (res.ok) {
                const data = await res.json();
                setTables(data.tables || []);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTables();
    }, [fetchTables]);

    const handleAdd = async () => {
        const label = newLabel.trim();
        if (!label) return;
        setIsSaving(true);
        setError("");
        try {
            const res = await fetch("/api/tables", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ label }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Failed to add table");
                return;
            }
            setTables((prev) => [...prev, data.table]);
            setNewLabel("");
            setShowAddModal(false);
        } catch {
            setError("Failed to add table");
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleActive = async (table) => {
        const res = await fetch(`/api/tables/${table._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !table.isActive }),
        });
        if (res.ok) {
            const data = await res.json();
            setTables((prev) => prev.map((t) => (t._id === table._id ? data.table : t)));
        }
    };

    const handleDelete = async (table) => {
        const res = await fetch(`/api/tables/${table._id}`, { method: "DELETE" });
        if (res.ok) {
            setTables((prev) => prev.filter((t) => t._id !== table._id));
        }
    };

    if (!restaurant) return null;

    const activeCount = tables.filter((t) => t.isActive).length;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold font-display tracking-tight flex items-center gap-3">
                        <Utensils className="w-8 h-8 text-primary" />
                        Tables
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Name your tables so guests can pick theirs when ordering from your menu link.
                    </p>
                </div>
                <Button onClick={() => { setShowAddModal(true); setError(""); }} size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Table
                </Button>
            </div>

            {activeCount > 0 && (
                <Card className="p-5 bg-primary/5 border-primary/10">
                    <p className="text-sm font-medium">
                        Ordering is now live on your menu link - guests will be asked which table they're at before placing an order. No new QR code needed, just keep using the one you already have.
                    </p>
                </Card>
            )}

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : tables.length === 0 ? (
                <Card className="p-12 text-center bg-white/50 backdrop-blur-sm">
                    <Utensils className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                    <p className="font-semibold text-lg">No tables yet</p>
                    <p className="text-muted-foreground mt-1">Add your tables to turn on ordering from your existing menu link.</p>
                </Card>
            ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                    {tables.map((table) => (
                        <Card key={table._id} className="flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-lg">{table.label}</CardTitle>
                                <button
                                    onClick={() => handleToggleActive(table)}
                                    title={table.isActive ? "Deactivate table" : "Activate table"}
                                    className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${
                                        table.isActive
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-zinc-100 text-zinc-500"
                                    }`}
                                >
                                    <Power className="w-3 h-3" />
                                    {table.isActive ? "Active" : "Inactive"}
                                </button>
                            </CardHeader>
                            <CardContent className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(table)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add Table"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleAdd} disabled={!newLabel.trim() || isSaving}>
                            {isSaving ? "Adding..." : "Add Table"}
                        </Button>
                    </>
                }
            >
                <div className="space-y-3">
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-500">Table Label</label>
                    <input
                        autoFocus
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        maxLength={40}
                        placeholder="e.g. Table 4"
                        className="w-full px-4 py-2.5 bg-zinc-50 border-2 border-transparent rounded-xl text-sm font-semibold focus:bg-white focus:border-zinc-900 transition-all outline-none"
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
            </Modal>
        </div>
    );
}

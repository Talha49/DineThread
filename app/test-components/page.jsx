"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Mail, Lock, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function TestComponentsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="min-h-screen bg-muted/20 p-8 space-y-12">
            <div className="max-w-5xl mx-auto space-y-12">
                <header className="space-y-4">
                    <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Davoriq UI Kit
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Chunk 1.1 & 1.2 Verification: Base Component Library
                    </p>
                </header>

                {/* Buttons Section */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b pb-2">Buttons</h2>
                    <div className="flex flex-wrap gap-4 items-center p-6 bg-card rounded-xl border shadow-sm">
                        <Button>Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="destructive">Destructive</Button>
                        <Button disabled>Disabled</Button>
                        <Button isLoading>Loading</Button>
                        <Button size="sm">Small</Button>
                        <Button size="lg">Large</Button>
                    </div>
                </section>

                {/* Inputs Section */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b pb-2">Inputs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-card rounded-xl border shadow-sm">
                        <Input
                            label="Email Address"
                            placeholder="hello@example.com"
                            startIcon={<Mail className="h-4 w-4" />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            label="Password"
                            type="password"
                            startIcon={<Lock className="h-4 w-4" />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Input
                            label="Search Menu"
                            endIcon={<Search className="h-4 w-4" />}
                        />
                        <Input
                            label="Error State"
                            error="Invalid email address"
                            defaultValue="invalid-email"
                        />
                    </div>
                </section>

                {/* Cards Section */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b pb-2">Cards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Standard Card</CardTitle>
                                <CardDescription>Default surface variant</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">This is a standard card component used for general content.</p>
                            </CardContent>
                            <CardFooter>
                                <Button size="sm" className="w-full">Action</Button>
                            </CardFooter>
                        </Card>

                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle>Glassmorphism Card</CardTitle>
                                <CardDescription>Backdrop blur effect</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">This card uses the custom glass utility class for a premium feel.</p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="secondary" size="sm" className="w-full">Action</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </section>

                {/* Modals Section */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b pb-2">Modals</h2>
                    <div className="p-6 bg-card rounded-xl border shadow-sm">
                        <Button onClick={() => setIsModalOpen(true)} size="lg">
                            Open Demo Modal
                        </Button>

                        <Modal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            title="Edit Menu Item"
                            footer={
                                <>
                                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button onClick={() => setIsModalOpen(false)}>Save Changes</Button>
                                </>
                            }
                        >
                            <div className="space-y-4">
                                <p className="text-muted-foreground">
                                    This is a custom accessible modal component with animations and focus management.
                                </p>
                                <div className="grid gap-4">
                                    <Input label="Item Name" placeholder="e.g. Truffle Burger" />
                                    <Input label="Price" type="number" startIcon={<span className="text-xs">$</span>} />
                                    <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed">
                                        <span className="text-sm text-muted-foreground">Image Upload Area</span>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                    </div>
                </section>

                {/* Toasts Section */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b pb-2">Toasts</h2>
                    <div className="flex flex-wrap gap-4 p-6 bg-card rounded-xl border shadow-sm">
                        <Button onClick={() => toast.success("Menu item created successfully!")}>
                            Success Toast
                        </Button>
                        <Button variant="destructive" onClick={() => toast.error("Failed to save changes. Please try again.")}>
                            Error Toast
                        </Button>
                        <Button variant="secondary" onClick={() => toast("Just a simple notification.")}>
                            Default Toast
                        </Button>
                        <Button variant="outline" onClick={() => toast.loading("Uploading image...", { duration: 2000 })}>
                            Loading Toast
                        </Button>
                        <Button variant="ghost" onClick={() => toast.custom((t) => (
                            <div className="glass px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                                <span className="text-2xl">🍕</span>
                                <div>
                                    <h4 className="font-bold">Order Received!</h4>
                                    <p className="text-xs text-muted-foreground">Kitchen is preparing it now.</p>
                                </div>
                            </div>
                        ))}>
                            Custom JSX Toast
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    );
}

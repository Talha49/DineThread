"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import toast from "react-hot-toast";
import { Lock, Mail, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { AuthService } from "@/services/authService";

export default function SignupPage() {
    const router = useRouter();
    const { login, refresh } = useAuth();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [strength, setStrength] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'password') {
            // Simple strength calc
            let s = 0;
            if (value.length > 6) s += 25;
            if (value.length > 10) s += 25;
            if (/[A-Z]/.test(value)) s += 25;
            if (/[0-9!@#$%^&*]/.test(value)) s += 25;
            setStrength(Math.min(s, 100));
        }
    };

    const getStrengthColor = (s) => {
        if (s <= 25) return "bg-red-500";
        if (s <= 50) return "bg-orange-500";
        if (s <= 75) return "bg-yellow-500";
        return "bg-green-500";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            // 1. Register User (creates user and issues session cookie)
            await AuthService.signup({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            // 2. Authenticate session state in context
            const loginResult = await login({
                email: formData.email,
                password: formData.password,
            });

            if (!loginResult.success) {
                await refresh();
            }

            toast.success("Account created successfully!");
            router.push("/onboarding");
        } catch (error) {
            toast.error(error.message || "Something went wrong during registration");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
            <div className="max-w-md w-full animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent inline-block mb-2">
                        Davoriq
                    </h1>
                    <p className="text-muted-foreground">Start your 14-day free trial</p>
                </div>

                <Card className="glass border-none shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl">Create an account</CardTitle>
                        <CardDescription>
                            Join thousands of restaurants growing with Davoriq
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <Input
                                name="name"
                                label="Full Name"
                                placeholder="John Doe"
                                startIcon={<User className="h-4 w-4" />}
                                required
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <Input
                                name="email"
                                label="Email"
                                type="email"
                                placeholder="name@example.com"
                                startIcon={<Mail className="h-4 w-4" />}
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <div className="space-y-2">
                                <Input
                                    name="password"
                                    label="Password"
                                    type="password"
                                    startIcon={<Lock className="h-4 w-4" />}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                {formData.password && (
                                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${getStrengthColor(strength)}`}
                                            style={{ width: `${strength}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                            <Input
                                name="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                startIcon={<CheckCircle2 className="h-4 w-4" />}
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
                                size="lg"
                                isLoading={loading}
                            >
                                Create Account
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <div className="text-center text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link href="/login" className="text-primary font-medium hover:underline">
                                    Sign in
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}

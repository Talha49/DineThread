"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import toast from "react-hot-toast";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { useTranslation } from "@/store/useTranslation";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await login({
                email: formData.email,
                password: formData.password,
            });

            if (!result.success) {
                toast.error(result.error || "Invalid email or password");
            } else {
                toast.success("Welcome back!");
                if (result.user && !result.user.restaurantId) {
                    router.push("/onboarding");
                } else {
                    router.push("/dashboard");
                }
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4 relative">
            <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto">
                <LanguageSwitcher />
            </div>
            <div className="max-w-md w-full animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent inline-block mb-2">
                        Davoriq
                    </h1>
                    <p className="text-muted-foreground">{t('home.hero.subtitle').substring(0, 40)}...</p>
                </div>

                <Card className="glass border-none shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl">{t('auth.login.title')}</CardTitle>
                        <CardDescription>
                            {t('auth.login.subtitle')}
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <Input
                                name="email"
                                label={t('auth.login.email')}
                                type="email"
                                placeholder="name@example.com"
                                startIcon={<Mail className="h-4 w-4 rtl:ml-2" />}
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <Input
                                name="password"
                                label={t('auth.login.password')}
                                type="password"
                                startIcon={<Lock className="h-4 w-4 rtl:ml-2" />}
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <div className="flex items-center justify-end">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-medium text-primary hover:text-primary/90 transition-colors"
                                >
                                    {t('auth.login.forgot')}
                                </Link>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
                                size="lg"
                                isLoading={loading}
                            >
                                {t('auth.login.submit')}
                                <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180 h-4 w-4" />
                            </Button>
                            <div className="text-center text-sm text-muted-foreground">
                                {t('auth.login.no_account')}{" "}
                                <Link href="/signup" className="text-primary font-medium hover:underline">
                                    {t('auth.login.signup')}
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}

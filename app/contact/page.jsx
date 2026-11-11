"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export default function ContactPage({ user }) {
    return (
        <div className="min-h-screen bg-white">
            <Navbar user={user} />

            <main className="pt-32 pb-24 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-50 border border-zinc-100 mb-4"
                        >
                            <MessageSquare className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Global Support Active</span>
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-zinc-900 leading-none">
                            Let's grow your <br />
                            <span className="text-zinc-300">business together</span>
                        </h1>
                        <p className="text-lg text-zinc-500 font-medium">
                            Have questions about our plans or need help setting up your menu? Our team of designers and support specialists is ready to assist you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        {/* Contact Form */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-10 md:p-16 rounded-[4rem] bg-zinc-900 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
                            
                            <form className="relative z-10 space-y-8" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Full Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="John Doe"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Email Address</label>
                                        <input 
                                            type="email" 
                                            placeholder="john@company.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Subject</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary transition-colors appearance-none">
                                        <option className="bg-zinc-900">General Inquiry</option>
                                        <option className="bg-zinc-900">Sales & Enterprise</option>
                                        <option className="bg-zinc-900">Technical Support</option>
                                        <option className="bg-zinc-900">Partnership</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Your Message</label>
                                    <textarea 
                                        rows="5"
                                        placeholder="Tell us about your project..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors"
                                    ></textarea>
                                </div>

                                <Button className="w-full h-16 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20">
                                    Send Message <Send className="ml-3 w-4 h-4" />
                                </Button>
                            </form>
                        </motion.div>

                        {/* Contact Info */}
                        <div className="space-y-12 py-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 rounded-[3rem] bg-zinc-50 border-2 border-zinc-100 hover:border-primary/20 transition-colors group">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Mail className="w-5 h-5 text-zinc-900" />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Email Us</h4>
                                    <p className="text-lg font-black italic tracking-tighter uppercase text-zinc-900">hello@smartmenu.ai</p>
                                </div>
                                <div className="p-8 rounded-[3rem] bg-zinc-50 border-2 border-zinc-100 hover:border-primary/20 transition-colors group">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Phone className="w-5 h-5 text-zinc-900" />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Call Us</h4>
                                    <p className="text-lg font-black italic tracking-tighter uppercase text-zinc-900">+44 20 7946 0958</p>
                                </div>
                                <div className="p-8 rounded-[3rem] bg-zinc-50 border-2 border-zinc-100 hover:border-primary/20 transition-colors group">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <MapPin className="w-5 h-5 text-zinc-900" />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">HQ Office</h4>
                                    <p className="text-lg font-black italic tracking-tighter uppercase text-zinc-900">London, SW1A 1AA</p>
                                </div>
                                <div className="p-8 rounded-[3rem] bg-zinc-50 border-2 border-zinc-100 hover:border-primary/20 transition-colors group">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Globe className="w-5 h-5 text-zinc-900" />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Global Coverage</h4>
                                    <p className="text-lg font-black italic tracking-tighter uppercase text-zinc-900">24/7 Availability</p>
                                </div>
                            </div>

                            <div className="p-12 rounded-[4rem] bg-gradient-to-br from-zinc-50 to-white border-2 border-zinc-100 relative overflow-hidden group">
                                <Sparkles className="absolute -right-4 -top-4 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform duration-1000" />
                                <h4 className="text-2xl font-black italic tracking-tighter uppercase text-zinc-900 mb-4">Enterprise Inquiries</h4>
                                <p className="text-sm text-zinc-500 font-medium mb-8 leading-relaxed">
                                    Looking for dedicated account management and custom deployment? Our enterprise team handles global rollouts for hotel chains and franchises.
                                </p>
                                <Button variant="outline" className="h-14 rounded-2xl px-10 text-[10px] font-black uppercase tracking-widest border-2">
                                    Book a Demo
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

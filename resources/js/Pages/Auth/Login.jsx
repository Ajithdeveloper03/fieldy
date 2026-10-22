import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const handleLogin = (e) => {
        e.preventDefault();
        post('/admin/login');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--color-hp-bg)] font-sans">
            <Head title="Log In - Fieldy Control Panel" />

            {/* Container */}
            <div className="w-full max-w-md">
                {/* Logo & Brand Header */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-44 h-16 flex items-center justify-center mb-2">
                        <img 
                            src="/images/logo.png" 
                            alt="Fieldy" 
                            className="w-full h-full object-contain" 
                        />
                    </div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-hp-gray-500)]">
                        Operations Control Panel
                    </span>
                </div>

                {/* Hostinger-style Clean Login Card */}
                <div className="hp-card p-6 sm:p-8 bg-white border border-[var(--color-hp-border)] shadow-xs rounded-xl">
                    <div className="mb-6 text-center">
                        <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-hp-dark)] tracking-tight">
                            Log in to your account
                        </h1>
                        <p className="text-xs sm:text-sm text-[var(--color-hp-gray-600)] mt-1">
                            Enter your credentials to access your organization dashboard.
                        </p>
                    </div>

                    {/* Global error banner */}
                    {errors.email && (
                        <div className="mb-4 flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3.5 py-2.5">
                            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                            <span className="text-rose-700 text-xs font-semibold">{errors.email}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-[var(--color-hp-gray-400)]" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="hp-input pl-10"
                                    placeholder="admin@infinityorganics.com"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-semibold text-[var(--color-hp-dark)]">
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-[var(--color-hp-gray-400)]" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="hp-input pl-10"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>
                            {errors.password && <div className="text-rose-600 text-xs mt-1">{errors.password}</div>}
                        </div>

                        {/* Submit Button: Hostinger Style Primary */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full hp-btn hp-btn-primary py-2.5 text-sm font-semibold flex items-center justify-center gap-2 shadow-xs"
                        >
                            {processing ? (
                                <div className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Authenticating...</span>
                                </div>
                            ) : (
                                <>
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Log in</span>
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Quick Demo Credentials Panel */}
                    <div className="mt-5 p-3 rounded-lg border border-[var(--color-hp-border)] bg-[var(--color-hp-gray-50)] space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[var(--color-hp-gray-600)]">
                            <span className="font-semibold text-[var(--color-hp-dark)]">Superadmin:</span>
                            <span className="font-mono text-[var(--color-hp-primary)] font-semibold">superadmin@fieldy.in / SuperAdmin@1234</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[var(--color-hp-gray-600)] pt-1.5 border-t border-[var(--color-hp-border)]">
                            <span className="font-semibold text-[var(--color-hp-dark)]">Client Admin:</span>
                            <span className="font-mono text-emerald-700 font-semibold">admin@infinityorganics.com / admin@123</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-xs text-[var(--color-hp-gray-500)]">
                    &copy; 2026 Fieldy Operations Platform. All rights reserved.
                </div>
            </div>
        </div>
    );
}

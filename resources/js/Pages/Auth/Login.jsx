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
        <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden bg-surface-primary">
            <Head title="Login - Fieldy Admin" />

            {/* Full Screen Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/image12.jpg"
                    alt="Agricultural Landscape"
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/80 to-brand-green/20 backdrop-blur-md"></div>
            </div>

            {/* Login Container */}
            <div className="relative z-10 w-full max-w-md px-6">

                {/* Centered Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-56 h-24 bg-white rounded-2xl border border-border-subtle shadow-xl mb-4 mt-4 flex items-center justify-center overflow-hidden px-4 py-2">
                        <img src="/images/logo.png" alt="Fieldy" className="w-full h-full object-contain" />
                    </div>
                   
                </div>

                {/* Elegant Form Card */}
                <div className="bg-white/80 backdrop-blur-xl border border-border-subtle rounded-3xl p-8 shadow-2xl">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-heading font-bold text-text-main mb-2">Welcome Back</h2>
                        <p className="text-sm font-medium text-text-muted">Enter your credentials to access the secure dashboard.</p>
                    </div>

                    {/* Global error banner */}
                    {errors.email && (
                        <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <span className="text-red-600 text-sm font-medium">{errors.email}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
                        <div className="group">
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-text-muted group-focus-within:text-brand-green transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-border-subtle rounded-xl text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all shadow-sm"
                                    placeholder="admin@infinityorganics.com"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="group">
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-text-muted group-focus-within:text-brand-green transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-border-subtle rounded-xl text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all shadow-sm"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>
                            {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-brand-green hover:bg-brand-light-green text-white py-4 rounded-xl font-bold flex items-center justify-center transition-all shadow-md shadow-brand-green/20 hover:shadow-lg disabled:opacity-70"
                        >
                            {processing ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Authenticating...
                                </div>
                            ) : (
                                <>
                                    <ShieldCheck className="w-5 h-5 mr-2" />
                                    Secure Login
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Credential hint */}
                    <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-xs text-amber-700 font-medium text-center">
                            🔑 <strong>Demo credentials:</strong> admin@infinityorganics.com / admin@123
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center text-xs font-bold text-text-muted tracking-wider">
                    &copy; 2026 FIELDY. ALL RIGHTS RESERVED.
                </div>
            </div>
        </div>
    );
}

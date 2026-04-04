import { useState, useEffect } from "react";
import { X, Mail, Lock, User, LogIn, UserPlus } from "lucide-react";
import { supabase } from "../utils/supabase";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: "login" | "signup";
    onSuccess: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, initialMode = "login", onSuccess }: AuthModalProps) {
    const [mode, setMode] = useState<"login" | "signup">(initialMode);

    // Form State
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Reset state when modal opens or mode changes
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setUsername("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setError("");
            setSuccessMessage("");
            setLoading(false);
        }
    }, [isOpen, initialMode]);

    if (!isOpen) return null;

    const validateEmail = (emailStr: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setError("");
        setSuccessMessage("");

        if (mode === "signup") {
            if (!username.trim()) {
                setError("Username is required");
                return;
            }
            if (!validateEmail(email)) {
                setError("Invalid email format");
                return;
            }
            if (password.length < 6) {
                setError("Password must be at least 6 characters");
                return;
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match");
                return;
            }

            setLoading(true);
            try {
                const { data, error } = await supabase.auth.signUp({
                    email: email.trim(),
                    password: password,
                    options: {
                        data: {
                            username: username.trim()
                        }
                    }
                });

                if (error) {
                    setError(error.message);
                } else if (data.user) {
                    // Reset form fields
                    setUsername("");
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                    
                    // Switch to login mode immediately
                    setMode("login");
                }
            } catch (err: any) {
                setError("An unexpected error occurred during signup.");
            }
            setLoading(false);

        } else {
            // Login mode
            if (!validateEmail(email)) {
                setError("Invalid email format");
                return;
            }
            if (!password) {
                setError("Password is required");
                return;
            }

            setLoading(true);
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password: password
                });

                if (error) {
                    if (error.message.includes("Email not confirmed")) {
                        setError("Please verify your email first");
                    } else {
                        setError(error.message);
                    }
                } else if (data.user) {
                    const validUser = { 
                        id: data.user.id,
                        email: data.user.email,
                        username: data.user.user_metadata?.username || "User"
                    };
                    localStorage.setItem("user", JSON.stringify(validUser));
                    localStorage.setItem("isLoggedIn", "true");
                    
                    // Optionally fetch profile details here if needed further
                    
                    onSuccess(validUser);
                }
            } catch (err: any) {
                setError("An unexpected error occurred during login.");
            }
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8 transform transition-all m-4">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {mode === "login" ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm">
                        {mode === "login"
                            ? "Sign in to continue your career journey"
                            : "Start tracking your career readiness today"}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 text-center">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 p-3 bg-green-50 text-green-600 text-sm font-medium rounded-lg border border-green-100 text-center">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "signup" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={loading}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
                                    placeholder="johndoe"
                                />
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    )}
                    


                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
                                placeholder="you@example.com"
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                    </div>

                    {mode === "signup" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
                                    placeholder="••••••••"
                                />
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
                    >
                        {loading ? (
                            <span className="inline-block animate-pulse">Processing...</span>
                        ) : mode === "login" ? (
                            <>Sign In <LogIn className="w-4 h-4" /></>
                        ) : (
                            <>Create Account <UserPlus className="w-4 h-4" /></>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    {mode === "login" ? (
                        <p>
                            Don't have an account?{" "}
                            <button
                                onClick={() => setMode("signup")}
                                disabled={loading}
                                className="text-blue-600 font-semibold hover:underline"
                            >
                                Sign up
                            </button>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{" "}
                            <button
                                onClick={() => setMode("login")}
                                disabled={loading}
                                className="text-blue-600 font-semibold hover:underline"
                            >
                                Log in
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

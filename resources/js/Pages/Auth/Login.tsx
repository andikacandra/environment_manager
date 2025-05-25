"use client";

import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { type FormEventHandler, useEffect, useState, useMemo } from "react";
import {
    EyeIcon,
    EyeOffIcon,
    Loader2,
    LockIcon,
    MailIcon,
    MonitorIcon,
    DatabaseIcon,
    BrainIcon,
    ChevronDownIcon,
} from "lucide-react";

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showMobileTeam, setShowMobileTeam] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    const teamMembers = useMemo(
        () => [
            {
                name: "Muhammad Sholaahuddin Al Fatih",
                role: "Backend Developer",
                description:
                    "Responsible for server-side logic, database design, and API development.",
                icon: <DatabaseIcon className="h-6 w-6" />,
                color: "from-blue-500 to-blue-700",
                image: "/images/fatih.jpg",
            },
            {
                name: "Haidar Yamato Lahay",
                role: "System Analyst",
                description:
                    "Designs system architecture and ensures optimal application performance.",
                icon: <BrainIcon className="h-6 w-6" />,
                color: "from-purple-500 to-purple-700",
                image: "/images/haidar.jpg",
            },
            {
                name: "Navy Ardana",
                role: "Frontend Developer",
                description:
                    "Creates responsive and intuitive user interfaces with modern frameworks.",
                icon: <MonitorIcon className="h-6 w-6" />,
                color: "from-indigo-500 to-indigo-700",
                image: "/images/navy.jpg",
            },
        ],
        []
    );

    const TeamMembersList = useMemo(
        () => (
            <div className="space-y-6">
                {teamMembers.map((member, index) => (
                    <div
                        key={index}
                        className={`bg-gradient-to-r ${member.color} p-5 rounded-xl shadow-xl team-card-hover animate-fadeIn`}
                        style={{ animationDelay: `${index * 150}ms` }}
                    >
                        <div className="flex items-start">
                            <div className="mr-4 relative">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/40 shadow-lg team-photo">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-white/20 p-1.5 rounded-full backdrop-blur-sm badge-pulse">
                                    {member.icon}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">
                                    {member.name}
                                </h3>
                                <p className="text-white/90 font-medium">
                                    {member.role}
                                </p>
                                <p className="text-white/75 text-sm mt-2">
                                    {member.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ),
        [teamMembers]
    );

    const MobileTeamList = useMemo(
        () => (
            <div className="space-y-4 pb-4">
                {teamMembers.map((member, index) => (
                    <div
                        key={index}
                        className={`bg-gradient-to-r ${member.color} p-3 rounded-lg shadow-md text-white`}
                    >
                        <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/40 mr-3">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">
                                    {member.name}
                                </h3>
                                <p className="text-white/90 text-xs">
                                    {member.role}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ),
        [teamMembers]
    );

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="min-h-screen flex flex-col md:flex-row bg-grid-light">
                <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 flex-col justify-between animate-slideInLeft">
                    <div className="mt-8">
                        <div className="flex items-center mb-8">
                            <div className="h-10 w-10 relative mr-3">
                                <div className="absolute inset-0 flex items-center justify-center bg-white rounded-xl shadow-lg">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-indigo-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold animate-fadeIn animate-delay-300">
                                Environment Manager
                            </h1>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-gradient animate-fadeIn animate-delay-200">
                            Meet Our Team
                        </h2>
                        <p className="text-indigo-100 mb-8 animate-fadeIn animate-delay-300">
                            Our talented team of developers dedicated to
                            creating powerful environment management solutions.
                        </p>

                        {TeamMembersList}
                    </div>

                    <div className="mt-auto pt-10">
                        <p className="text-sm text-indigo-200">
                            © 2025 Environment Manager. All rights reserved.
                        </p>
                    </div>
                </div>

                {/* Login Form (Full width on mobile, half width on md+ screens) */}
                <div className="w-full md:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 animate-slideInRight">
                    <div
                        className={`max-w-md w-full space-y-8 transition-all duration-700 ease-in-out ${
                            isLoading
                                ? "opacity-0 translate-y-4"
                                : "opacity-100 translate-y-0"
                        }`}
                    >
                        {/* Logo and Header */}
                        <div className="text-center">
                            <div className="mx-auto h-14 w-14 relative">
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"
                                        />
                                    </svg>
                                </div>
                                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-500 opacity-30 blur-sm animate-pulse"></div>
                            </div>
                            <h2 className="mt-8 text-3xl font-extrabold text-gray-900 tracking-tight text-gradient">
                                Welcome back
                            </h2>
                            <p className="mt-3 text-base text-gray-600">
                                Sign in to access your Environment Manager
                                account
                            </p>
                        </div>

                        {/* Mobile Team Toggle Button (Visible only on mobile) */}
                        <div className="md:hidden">
                            <button
                                type="button"
                                className="w-full flex justify-between items-center py-2 px-4 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium transition-all hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={() =>
                                    setShowMobileTeam(!showMobileTeam)
                                }
                            >
                                <span>Meet our development team</span>
                                <ChevronDownIcon
                                    className={`h-4 w-4 transition-transform ${
                                        showMobileTeam ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {/* Mobile Team Cards (Collapsible) */}
                            {showMobileTeam && (
                                <div className="mt-3 transition-all duration-300 overflow-hidden max-h-[1000px] opacity-100">
                                    {MobileTeamList}
                                </div>
                            )}
                        </div>

                        {/* Login Form */}
                        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-gray-100 glass-effect">
                            {status && (
                                <div className="mb-6 font-medium text-sm text-green-600 bg-green-50 p-4 rounded-lg border border-green-100 flex items-start">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span>{status}</span>
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={submit}>
                                {/* Email Input */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Email address
                                    </label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MailIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            className={`pl-10 block w-full border h-12 rounded-lg focus-ring ${
                                                errors.email
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="name@company.com"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData("email", e.target.value)
                                            }
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label
                                            htmlFor="password"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Password
                                        </label>
                                    </div>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <LockIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            autoComplete="current-password"
                                            required
                                            className={`pl-10 block w-full border h-12 rounded-lg focus-ring ${
                                                errors.password
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Remember Me Checkbox */}
                                <div className="flex items-center">
                                    <input
                                        id="remember"
                                        name="remember"
                                        type="checkbox"
                                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                "remember",
                                                e.target.checked
                                            )
                                        }
                                    />
                                    <label
                                        htmlFor="remember"
                                        className="ml-3 block text-sm text-gray-700"
                                    >
                                        Keep me signed in
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus-ring relative overflow-hidden h-12"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            "Sign in"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 text-center text-xs text-gray-500">
                            <p>
                                By signing in, you agree to our{" "}
                                <a
                                    href="#"
                                    className="text-indigo-600 hover:text-indigo-500 underline underline-offset-2"
                                >
                                    Terms of Service
                                </a>{" "}
                                and{" "}
                                <a
                                    href="#"
                                    className="text-indigo-600 hover:text-indigo-500 underline underline-offset-2"
                                >
                                    Privacy Policy
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}

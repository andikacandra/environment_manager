"use client";

import { useState, useRef, useEffect } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowLeft,
    Loader2,
    User,
    Mail,
    Info,
    CheckCircle2,
    Shield,
    UserPlus,
    Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageProps, Role } from "@/types";

interface UsersCreateProps extends PageProps {
    roles: Role[];
}

const UsersCreate = () => {
    const { roles } = usePage<UsersCreateProps>().props;
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [formStrength, setFormStrength] = useState(0);
    const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        full_name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "",
    });

    // Auto-focus name input on component mount
    useEffect(() => {
        if (nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, []);

    // Calculate form completion strength
    useEffect(() => {
        let strength = 0;

        if (data.full_name) strength += 20;
        if (data.email) strength += 20;
        if (data.password) strength += 20;
        if (
            data.password_confirmation &&
            data.password === data.password_confirmation
        )
            strength += 20;
        if (data.role) strength += 20;

        setFormStrength(Math.min(strength, 100));
    }, [
        data.full_name,
        data.email,
        data.password,
        data.password_confirmation,
        data.role,
    ]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("users.store"), {
            onSuccess: () => {
                reset(
                    "full_name",
                    "email",
                    "password",
                    "password_confirmation",
                    "role"
                );
                setShowSuccessMessage(true);
                setTimeout(() => setShowSuccessMessage(false), 3000);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create User" />

            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: "Users", href: route("users.index") },
                    { label: "Create User" },
                ]}
            />

            {/* Hero Header */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="relative px-6 py-8 sm:px-8 md:flex md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Create New User
                        </h1>
                        <p className="mt-2 max-w-2xl text-indigo-100">
                            Add a new user to the system and assign appropriate
                            roles and permissions.
                        </p>
                    </div>
                    <Link href={route("users.index")}>
                        <Button
                            variant="outline"
                            className="gap-1 bg-white/10 text-white backdrop-blur-sm border-white/20 hover:bg-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Users
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
                <Alert className="mb-6 border-green-200 bg-green-50 text-green-800 animate-in fade-in slide-in-from-top-5 duration-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                        User created successfully!
                    </AlertDescription>
                </Alert>
            )}

            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b bg-gray-50/80 px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl text-gray-800">
                                User Information
                            </CardTitle>
                            <CardDescription>
                                Fill in the details to create a new user account
                            </CardDescription>
                        </div>
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                            <UserPlus className="h-5 w-5" />
                        </div>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6 p-6">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="name"
                                    className="text-sm font-medium"
                                >
                                    Full Name{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 cursor-help text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                            <p className="w-60 text-xs">
                                                Enter the user's full name as it
                                                will appear throughout the
                                                system.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="relative">
                                <Input
                                    id="name"
                                    ref={nameInputRef}
                                    type="text"
                                    placeholder="Enter full name"
                                    value={data.full_name}
                                    onChange={(e) =>
                                        setData("full_name", e.target.value)
                                    }
                                    className={`pl-10 ${
                                        errors.full_name
                                            ? "border-red-300 ring-red-100"
                                            : data.full_name
                                            ? "border-green-300 ring-green-100"
                                            : "border-gray-300"
                                    } transition-all focus-visible:ring-blue-100 focus-visible:border-blue-500`}
                                    disabled={processing}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <User className="h-4 w-4" />
                                </div>
                                {data.full_name && !errors.full_name && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                            {errors.full_name ? (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                                    {errors.full_name}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500">
                                    The user's full name will be displayed in
                                    the UI
                                </p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium"
                                >
                                    Email Address{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 cursor-help text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                            <p className="w-60 text-xs">
                                                This email will be used for
                                                login and account notifications.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter email address"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className={`pl-10 ${
                                        errors.email
                                            ? "border-red-300 ring-red-100"
                                            : data.email
                                            ? "border-green-300 ring-green-100"
                                            : "border-gray-300"
                                    } transition-all focus-visible:ring-blue-100 focus-visible:border-blue-500`}
                                    disabled={processing}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail className="h-4 w-4" />
                                </div>
                                {data.email && !errors.email && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                            {errors.email ? (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                                    {errors.email}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500">
                                    Must be a valid and unique email address
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="text-sm font-medium"
                                >
                                    Password{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 cursor-help text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                            <p className="w-60 text-xs">
                                                Create a strong password with at
                                                least 8 characters including
                                                letters, numbers, and special
                                                characters.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    className={`pl-10 ${
                                        errors.password
                                            ? "border-red-300 ring-red-100"
                                            : data.password
                                            ? "border-green-300 ring-green-100"
                                            : "border-gray-300"
                                    } transition-all focus-visible:ring-blue-100 focus-visible:border-blue-500`}
                                    disabled={processing}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock className="h-4 w-4" />
                                </div>
                                {data.password && !errors.password && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                            {errors.password ? (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                                    {errors.password}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500">
                                    Must be at least 8 characters long
                                </p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-sm font-medium"
                                >
                                    Confirm Password{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    placeholder="Confirm password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    className={`pl-10 ${
                                        errors.password_confirmation
                                            ? "border-red-300 ring-red-100"
                                            : data.password_confirmation &&
                                              data.password ===
                                                  data.password_confirmation
                                            ? "border-green-300 ring-green-100"
                                            : "border-gray-300"
                                    } transition-all focus-visible:ring-blue-100 focus-visible:border-blue-500`}
                                    disabled={processing}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock className="h-4 w-4" />
                                </div>
                                {data.password_confirmation &&
                                    data.password ===
                                        data.password_confirmation &&
                                    !errors.password_confirmation && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                    )}
                            </div>
                            {errors.password_confirmation ? (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                                    {errors.password_confirmation}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500">
                                    Must match the password field above
                                </p>
                            )}
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="role"
                                    className="text-sm font-medium"
                                >
                                    User Role{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 cursor-help text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                            <p className="w-60 text-xs">
                                                The role determines what
                                                permissions and access levels
                                                the user will have in the
                                                system.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="relative">
                                <Select
                                    value={data.role}
                                    onValueChange={(value) =>
                                        setData("role", value)
                                    }
                                    disabled={processing}
                                >
                                    <SelectTrigger
                                        className={`pl-10 ${
                                            errors.role
                                                ? "border-red-300 ring-red-100"
                                                : data.role
                                                ? "border-green-300 ring-green-100"
                                                : "border-gray-300"
                                        } transition-all focus-visible:ring-blue-100 focus-visible:border-blue-500`}
                                    >
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem
                                                key={role.id}
                                                value={role.name}
                                            >
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Shield className="h-4 w-4" />
                                </div>
                                {data.role && !errors.role && (
                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                            {errors.role ? (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                                    {errors.role}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500">
                                    Choose a role that aligns with the user's
                                    responsibilities
                                </p>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end gap-3 border-t bg-gray-50/80 px-6 py-4">
                        <Link href={route("users.index")}>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={processing}
                                className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            >
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                !data.full_name ||
                                !data.email ||
                                !data.password ||
                                !data.password_confirmation ||
                                data.password !== data.password_confirmation ||
                                !data.role
                            }
                            className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4" />
                                    Create User
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </AuthenticatedLayout>
    );
};

// Helper functions
function getRoleDescription(roleName: string): string {
    const descriptions: Record<string, string> = {
        admin: "Full access to all system features and settings",
        manager: "Can manage users and content but not system settings",
        editor: "Can create and modify content but not manage users",
        viewer: "Read-only access to content",
        user: "Basic access to the platform",
    };

    return (
        descriptions[roleName.toLowerCase()] ||
        "Role-specific access to system features"
    );
}

function isFormValid(data: any): boolean {
    return !!(
        data.full_name &&
        data.email &&
        data.password &&
        data.password_confirmation &&
        data.password === data.password_confirmation &&
        data.role
    );
}

export default UsersCreate;

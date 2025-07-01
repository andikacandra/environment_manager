"use client";

import { useState, useRef, useEffect } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowLeft,
    Loader2,
    User as UserIcon,
    Mail,
    Info,
    CheckCircle2,
    UserCog,
    Lock,
    Save,
    Key,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageProps, User } from "@/types";

interface ProfileEditPageProps extends PageProps {
    user: User;
}

const EditProfile = () => {
    const { user } = usePage<ProfileEditPageProps>().props;
    const [showProfileSuccessMessage, setShowProfileSuccessMessage] =
        useState(false);
    const [showPasswordSuccessMessage, setShowPasswordSuccessMessage] =
        useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const {
        data: profileData,
        setData: setProfileData,
        patch: patchProfile,
        processing: profileProcessing,
        errors: profileErrors,
    } = useForm({
        full_name: user.full_name || "",
        email: user.email || "",
    });

    // Password change form
    const {
        data: passwordData,
        setData: setPasswordData,
        put,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPasswordData,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    // Auto-focus name input on component mount
    useEffect(() => {
        if (nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, []);

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patchProfile(route("users.update", user.id), {
            onSuccess: () => {
                setShowProfileSuccessMessage(true);
                setTimeout(() => setShowProfileSuccessMessage(false), 3000);
            },
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("password.update", user.id), {
            onSuccess: () => {
                resetPasswordData();
                setShowPasswordSuccessMessage(true);
                setTimeout(() => setShowPasswordSuccessMessage(false), 3000);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Profile" />

            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: "Profile", href: route("users.index") },
                    { label: "Edit Profile" },
                ]}
            />

            {/* Hero Header */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="relative px-6 py-8 sm:px-8 md:flex md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Edit {user.full_name} Profile
                        </h1>
                        <p className="mt-2 max-w-2xl text-indigo-100">
                            Update {user.full_name} account information or
                            change {user.full_name} password.
                        </p>
                    </div>
                    <Link href={route("dashboard")}>
                        <Button
                            variant="outline"
                            className="gap-1 bg-white/10 text-white backdrop-blur-sm border-white/20 hover:bg-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-2">
                    <TabsTrigger value="profile" className="gap-2">
                        <UserIcon className="h-4 w-4" /> Profile Information
                    </TabsTrigger>
                    <TabsTrigger value="password" className="gap-2">
                        <Lock className="h-4 w-4" /> Change Password
                    </TabsTrigger>
                </TabsList>

                {/* Profile Information Tab */}
                <TabsContent value="profile">
                    {showProfileSuccessMessage && (
                        <Alert className="mb-6 border-green-200 bg-green-50 text-green-800 animate-in fade-in slide-in-from-top-5 duration-300">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                                Profile updated successfully!
                            </AlertDescription>
                        </Alert>
                    )}

                    <Card className="border-gray-200 shadow-sm">
                        <CardHeader className="border-b bg-gray-50/80 px-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl text-gray-800">
                                        Profile Information
                                    </CardTitle>
                                    <CardDescription>
                                        Update {user.full_name} account's
                                        profile information
                                    </CardDescription>
                                </div>
                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                                    <UserCog className="h-5 w-5" />
                                </div>
                            </div>
                        </CardHeader>

                        <form onSubmit={handleProfileSubmit}>
                            <CardContent className="space-y-6 p-6">
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor="name"
                                            className="text-sm font-medium"
                                        >
                                            Full Name{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-4 w-4 cursor-help text-gray-400" />
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                                    <p className="w-60 text-xs">
                                                        Enter {user.full_name}{" "}
                                                        full name as it will
                                                        appear throughout the
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
                                            value={profileData.full_name}
                                            onChange={(e) =>
                                                setProfileData(
                                                    "full_name",
                                                    e.target.value
                                                )
                                            }
                                            className={`pl-10 ${
                                                profileErrors.full_name
                                                    ? "border-red-300 ring-red-100"
                                                    : profileData.full_name
                                                    ? "border-green-300 ring-green-100"
                                                    : "border-gray-300"
                                            } transition-all focus-visible:ring-blue-100 focus-visible:border-blue-500`}
                                            disabled={profileProcessing}
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <UserIcon className="h-4 w-4" />
                                        </div>
                                        {profileData.full_name &&
                                            !profileErrors.full_name && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                            )}
                                    </div>
                                    {profileErrors.full_name ? (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                                            {profileErrors.full_name}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500">
                                            {user.full_name} full name will be
                                            displayed in the UI
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
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-4 w-4 cursor-help text-gray-400" />
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                                    <p className="w-60 text-xs">
                                                        This email will be used
                                                        for login and account
                                                        notifications.
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
                                            value={profileData.email}
                                            onChange={(e) =>
                                                setProfileData(
                                                    "email",
                                                    e.target.value
                                                )
                                            }
                                            className={`pl-10 ${
                                                profileErrors.email
                                                    ? "border-red-300 ring-red-100"
                                                    : profileData.email
                                                    ? "border-green-300 ring-green-100"
                                                    : "border-gray-300"
                                            } transition-all focus-visible:ring-blue-100 focus-visible:border-blue-500`}
                                            disabled={profileProcessing}
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        {profileData.email &&
                                            !profileErrors.email && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                            )}
                                    </div>
                                    {profileErrors.email ? (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                                            {profileErrors.email}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500">
                                            Must be a valid and unique email
                                            address
                                        </p>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-end gap-3 border-t bg-gray-50/80 px-6 py-4">
                                <Button
                                    type="submit"
                                    disabled={
                                        profileProcessing ||
                                        !profileData.full_name ||
                                        !profileData.email
                                    }
                                    className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm"
                                >
                                    {profileProcessing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                {/* Change Password Tab */}
                <TabsContent value="password">
                    {showPasswordSuccessMessage && (
                        <Alert className="mb-6 border-green-200 bg-green-50 text-green-800 animate-in fade-in slide-in-from-top-5 duration-300">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                                Password updated successfully!
                            </AlertDescription>
                        </Alert>
                    )}

                    <Card className="border-gray-200 shadow-sm">
                        <CardHeader className="border-b bg-gray-50/80 px-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl text-gray-800">
                                        Change Password
                                    </CardTitle>
                                    <CardDescription>
                                        Ensure {user.full_name} account is using
                                        a secure password
                                    </CardDescription>
                                </div>
                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                                    <Key className="h-5 w-5" />
                                </div>
                            </div>
                        </CardHeader>

                        <form onSubmit={handlePasswordSubmit}>
                            <CardContent className="space-y-6 p-6">
                                {/* Current Password Field */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor="current_password"
                                            className="text-sm font-medium"
                                        >
                                            Current Password{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-4 w-4 cursor-help text-gray-400" />
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                                    <p className="w-60 text-xs">
                                                        Enter current password
                                                        to authorize the change.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="current_password"
                                            type="password"
                                            placeholder="Enter current password"
                                            value={
                                                passwordData.current_password
                                            }
                                            onChange={(e) =>
                                                setPasswordData(
                                                    "current_password",
                                                    e.target.value
                                                )
                                            }
                                            className={`pl-10 ${
                                                passwordErrors.current_password
                                                    ? "border-red-300 ring-red-100"
                                                    : passwordData.current_password
                                                    ? "border-green-300 ring-green-100"
                                                    : "border-gray-300"
                                            } transition-all focus-visible:ring-blue-100 focus-visible:border-blue-500`}
                                            disabled={passwordProcessing}
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Lock className="h-4 w-4" />
                                        </div>
                                        {passwordData.current_password &&
                                            !passwordErrors.current_password && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                            )}
                                    </div>
                                    {passwordErrors.current_password ? (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                                            {passwordErrors.current_password}
                                        </p>
                                    ) : null}
                                </div>

                                {/* New Password Field */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor="password"
                                            className="text-sm font-medium"
                                        >
                                            New Password{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-4 w-4 cursor-help text-gray-400" />
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                                    <p className="w-60 text-xs">
                                                        Create a strong password
                                                        with at least 8
                                                        characters including
                                                        letters, numbers, and
                                                        special characters.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Enter new password"
                                            value={passwordData.password}
                                            onChange={(e) =>
                                                setPasswordData(
                                                    "password",
                                                    e.target.value
                                                )
                                            }
                                            className={`pl-10 ${
                                                passwordErrors.password
                                                    ? "border-red-300 ring-red-100"
                                                    : passwordData.password
                                                    ? "border-green-300 ring-green-100"
                                                    : "border-gray-300"
                                            } transition-all focus-visible:ring-blue-100 focus-visible:border-blue-500`}
                                            disabled={passwordProcessing}
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Lock className="h-4 w-4" />
                                        </div>
                                        {passwordData.password &&
                                            !passwordErrors.password && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                            )}
                                    </div>
                                    {passwordErrors.password ? (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                                            {passwordErrors.password}
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
                                            Confirm New Password{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            placeholder="Confirm new password"
                                            value={
                                                passwordData.password_confirmation
                                            }
                                            onChange={(e) =>
                                                setPasswordData(
                                                    "password_confirmation",
                                                    e.target.value
                                                )
                                            }
                                            className={`pl-10 ${
                                                passwordErrors.password_confirmation
                                                    ? "border-red-300 ring-red-100"
                                                    : passwordData.password_confirmation &&
                                                      passwordData.password ===
                                                          passwordData.password_confirmation
                                                    ? "border-green-300 ring-green-100"
                                                    : "border-gray-300"
                                            } transition-all focus-visible:ring-blue-100 focus-visible:border-blue-500`}
                                            disabled={passwordProcessing}
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Lock className="h-4 w-4" />
                                        </div>
                                        {passwordData.password_confirmation &&
                                            passwordData.password ===
                                                passwordData.password_confirmation &&
                                            !passwordErrors.password_confirmation && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                            )}
                                    </div>
                                    {passwordErrors.password_confirmation ? (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                                            {
                                                passwordErrors.password_confirmation
                                            }
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500">
                                            Must match the new password field
                                            above
                                        </p>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-end gap-3 border-t bg-gray-50/80 px-6 py-4">
                                <Button
                                    type="submit"
                                    disabled={
                                        passwordProcessing ||
                                        !passwordData.current_password ||
                                        !passwordData.password ||
                                        !passwordData.password_confirmation ||
                                        passwordData.password !==
                                            passwordData.password_confirmation
                                    }
                                    className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm"
                                >
                                    {passwordProcessing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Key className="h-4 w-4" />
                                            Update Password
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </AuthenticatedLayout>
    );
};

export default EditProfile;

"use client";

import { useState, useRef, useEffect } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowLeft,
    Loader2,
    Users,
    Info,
    CheckCircle2,
    FolderTree,
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const GroupsCreate = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        description: "",
    });

    const [characterCount, setCharacterCount] = useState(0);
    const MAX_DESCRIPTION_LENGTH = 500;
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus name input on component mount
    useEffect(() => {
        if (nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("groups.store"), {
            onSuccess: () => {
                reset("name", "description");
                setCharacterCount(0);
                setShowSuccessMessage(true);
                setTimeout(() => setShowSuccessMessage(false), 3000);
            },
        });
    };

    const handleDescriptionChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const value = e.target.value;
        if (value.length <= MAX_DESCRIPTION_LENGTH) {
            setData("description", value);
            setCharacterCount(value.length);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Group" />

            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: "Groups", href: route("groups.index") },
                    { label: "Create Group" },
                ]}
            />

            {/* Hero Header - Keeping the original style */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="relative px-6 py-8 sm:px-8 md:flex md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Create New Group
                        </h1>
                        <p className="mt-2 max-w-2xl text-indigo-100">
                            Add a new group to organize and manage related
                            applications.
                        </p>
                    </div>
                    <Link href={route("groups.index")}>
                        <Button
                            variant="outline"
                            className="gap-1 bg-white/10 text-white backdrop-blur-sm border-white/20 hover:bg-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Groups
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
                <Alert className="mb-6 border-green-200 bg-green-50 text-green-800 animate-in fade-in slide-in-from-top-5 duration-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                        Group created successfully!
                    </AlertDescription>
                </Alert>
            )}

            {/* Main Form */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b bg-gray-50/80 px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl text-gray-800">
                                Group Information
                            </CardTitle>
                            <CardDescription>
                                Fill in the details below to create a new group
                            </CardDescription>
                        </div>
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                            <FolderTree className="h-5 w-5" />
                        </div>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6 p-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="name"
                                    className="text-sm font-medium"
                                >
                                    Group Name{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 cursor-help text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                            <p className="w-60 text-xs">
                                                Choose a descriptive and unique
                                                name for your group. This will
                                                help team members identify it
                                                easily.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="relative">
                                <Input
                                    id="name"
                                    type="text"
                                    ref={nameInputRef}
                                    placeholder="Enter group name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className={`pl-10 ${
                                        errors.name
                                            ? "border-red-300 ring-red-100"
                                            : data.name
                                            ? "border-green-300 ring-green-100"
                                            : "border-gray-300"
                                    } transition-all focus-visible:ring-indigo-100 focus-visible:border-indigo-500`}
                                    disabled={processing}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Users className="h-4 w-4" />
                                </div>
                                {data.name && !errors.name && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                            {errors.name ? (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                                    {errors.name}
                                </p>
                            ) : (
                                <p className="mt-1 text-xs text-gray-500">
                                    Use a clear, concise name that describes the
                                    purpose of this group.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="description"
                                    className="text-sm font-medium"
                                >
                                    Description
                                </Label>
                                <span
                                    className={`text-xs ${
                                        characterCount >
                                        MAX_DESCRIPTION_LENGTH * 0.8
                                            ? characterCount >
                                              MAX_DESCRIPTION_LENGTH * 0.95
                                                ? "text-red-500"
                                                : "text-amber-500"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {characterCount}/{MAX_DESCRIPTION_LENGTH}
                                </span>
                            </div>
                            <div className="relative">
                                <Textarea
                                    id="description"
                                    placeholder="Describe the purpose of this group (optional)"
                                    value={data.description}
                                    onChange={handleDescriptionChange}
                                    className={`min-h-[120px] resize-none pl-10 ${
                                        errors.description
                                            ? "border-red-300 ring-red-100"
                                            : data.description
                                            ? "border-green-300 ring-green-100"
                                            : "border-gray-300"
                                    } transition-all focus-visible:ring-indigo-100 focus-visible:border-indigo-500`}
                                    disabled={processing}
                                />
                                <div className="absolute left-3 top-3 text-gray-400">
                                    <Info className="h-4 w-4" />
                                </div>
                            </div>
                            {errors.description ? (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                                    {errors.description}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500">
                                    A clear description helps team members
                                    understand the purpose of this group.
                                </p>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end gap-3 border-t bg-gray-50/80 px-6 py-4">
                        <Link href={route("groups.index")}>
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
                            disabled={processing || !data.name}
                            className="gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-sm"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <FolderTree className="h-4 w-4" />
                                    Create Group
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </AuthenticatedLayout>
    );
};

export default GroupsCreate;

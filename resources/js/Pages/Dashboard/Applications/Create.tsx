"use client";

import { useState, useRef, useEffect } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowLeft,
    Loader2,
    AppWindow,
    Info,
    CheckCircle2,
    FolderClosed,
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
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Group, PageProps } from "@/types";

interface CreateApplicationProps extends PageProps {
    groups: Group[];
}

const ApplicationsCreate = () => {
    const { groups } = usePage<CreateApplicationProps>().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        description: "",
        group_id: "",
    });

    const [characterCount, setCharacterCount] = useState(0);
    const MAX_DESCRIPTION_LENGTH = 500;
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [formStrength, setFormStrength] = useState(0);
    const nameInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus name input on component mount
    useEffect(() => {
        if (nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, []);

    // Calculate form completion strength
    useEffect(() => {
        let strength = 0;

        if (data.name) {
            strength += 40; // Name has weight
        }

        if (data.description) {
            const descriptionValue = Math.min(
                (data.description.length / 50) * 30,
                30
            );
            strength += descriptionValue;
        }

        if (data.group_id) {
            strength += 30; // Group selection has weight
        }

        setFormStrength(Math.min(strength, 100));
    }, [data.name, data.description, data.group_id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("applications.store"), {
            onSuccess: () => {
                reset("name", "description", "group_id");
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
            <Head title="Create Application" />

            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    {
                        label: "Applications",
                        href: route("applications.index"),
                    },
                    { label: "Create Application" },
                ]}
            />

            {/* Hero Header */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="relative px-6 py-8 sm:px-8 md:flex md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Create New Application
                        </h1>
                        <p className="mt-2 max-w-2xl text-blue-100">
                            Applications are services or software components
                            that can be deployed across multiple environments.
                        </p>
                    </div>
                    <Link href={route("applications.index")}>
                        <Button
                            variant="outline"
                            className="gap-1 bg-white/10 text-white backdrop-blur-sm border-white/20 hover:bg-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to
                            Applications
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
                <Alert className="mb-6 border-green-200 bg-green-50 text-green-800 animate-in fade-in slide-in-from-top-5 duration-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                        Application created successfully!
                    </AlertDescription>
                </Alert>
            )}

            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b bg-gray-50/80 px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl text-gray-800">
                                Application Information
                            </CardTitle>
                            <CardDescription>
                                Fill in the details below to create a new
                                application
                            </CardDescription>
                        </div>
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                            <AppWindow className="h-5 w-5" />
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
                                    Application Name{" "}
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
                                                name for your application.
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
                                    placeholder="Enter application name"
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
                                    } transition-all focus-visible:ring-blue-100 focus-visible:border-blue-500`}
                                    disabled={processing}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <AppWindow className="h-4 w-4" />
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
                                    Use a clear, concise name that identifies
                                    this application.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="group_id"
                                    className="text-sm font-medium"
                                >
                                    Group{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 cursor-help text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                            <p className="w-60 text-xs">
                                                Select which group this
                                                application belongs to.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="relative">
                                <Select
                                    value={data.group_id}
                                    onValueChange={(value) =>
                                        setData("group_id", value)
                                    }
                                    disabled={processing}
                                >
                                    <SelectTrigger
                                        className={`pl-10 ${
                                            errors.group_id
                                                ? "border-red-300 ring-red-100"
                                                : data.group_id
                                                ? "border-green-300 ring-green-100"
                                                : "border-gray-300"
                                        } transition-all focus-visible:ring-blue-100 focus-visible:border-blue-500`}
                                    >
                                        <SelectValue placeholder="Select a group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map((group) => (
                                            <SelectItem
                                                key={group.id}
                                                value={group.id.toString()}
                                            >
                                                {group.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FolderClosed className="h-4 w-4" />
                                </div>
                                {data.group_id && !errors.group_id && (
                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                            {errors.group_id ? (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                                    {errors.group_id}
                                </p>
                            ) : (
                                <p className="mt-1 text-xs text-gray-500">
                                    Applications must belong to a specific
                                    group.
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
                                    placeholder="Describe the purpose of this application (optional)"
                                    value={data.description}
                                    onChange={handleDescriptionChange}
                                    className={`min-h-[120px] resize-none pl-10 ${
                                        errors.description
                                            ? "border-red-300 ring-red-100"
                                            : data.description
                                            ? "border-green-300 ring-green-100"
                                            : "border-gray-300"
                                    } transition-all focus-visible:ring-blue-100 focus-visible:border-blue-500`}
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
                                    understand what this application does.
                                </p>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end gap-3 border-t bg-gray-50/80 px-6 py-4">
                        <Link href={route("applications.index")}>
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
                                processing || !data.name || !data.group_id
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
                                    <AppWindow className="h-4 w-4" />
                                    Create Application
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </AuthenticatedLayout>
    );
};

export default ApplicationsCreate;

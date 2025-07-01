"use client";

import { useState, useRef, useEffect } from "react";
import { Head, useForm, usePage, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Application, PageProps } from "@/types";
import {
    ArrowLeft,
    Loader2,
    Check,
    Info,
    CheckCircle2,
    Database,
    Variable,
    AlertTriangle,
    Code,
    Eye,
    EyeOff,
    Server,
    ShieldAlert,
    ShieldCheck,
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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface CreateEnvVariablesProps extends PageProps {
    application: Application;
    canCreateDevelopment: boolean;
    canCreateStaging: boolean;
    canCreateProduction: boolean;
}

const EnvVariablesCreate = () => {
    const {
        application,
        canCreateDevelopment,
        canCreateStaging,
        canCreateProduction,
    } = usePage<CreateEnvVariablesProps>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        application_id: application.id.toString(),
        name: "",
        production_value: "",
        staging_value: "",
        development_value: "",
    });

    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const [showProductionValue, setShowProductionValue] = useState(false);
    const [showStagingValue, setShowStagingValue] = useState(false);
    const [showDevelopmentValue, setShowDevelopmentValue] = useState(false);

    // Determine initial active tab based on permissions
    const getInitialActiveTab = () => {
        if (canCreateProduction) return "production";
        if (canCreateStaging) return "staging";
        if (canCreateDevelopment) return "development";
        return "production";
    };
    const [activeTab, setActiveTab] = useState(getInitialActiveTab());
    // Auto-focus name input on component mount
    useEffect(() => {
        if (nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(
            route("applications.envVariables.store", {
                application: application,
            }),
            {
                onSuccess: () => {
                    reset(
                        "name",
                        "production_value",
                        "staging_value",
                        "development_value"
                    );
                    if (nameInputRef.current) {
                        nameInputRef.current.focus();
                    }
                    setShowSuccessMessage(true);
                    setTimeout(() => setShowSuccessMessage(false), 3000);
                },
            }
        );
    };

    // Format the variable name to follow convention (uppercase with underscores)
    const formatVariableName = (name: string) => {
        return name.trim().toUpperCase().replace(/\s+/g, "_");
    };

    // Helper to check if name follows convention
    const isNameValid = (name: string) => {
        const regex = /^[A-Z][A-Z0-9_]*$/;
        return regex.test(name);
    };

    // Check if at least one environment is accessible for creation
    const hasEnvAccess =
        canCreateDevelopment || canCreateStaging || canCreateProduction;

    // Check if the form can be submitted (has valid name and at least one environment value)
    const canSubmitForm = () => {
        if (!data.name || !isNameValid(data.name)) return false;

        return (
            (canCreateProduction && data.production_value) ||
            (canCreateStaging && data.staging_value) ||
            (canCreateDevelopment && data.development_value)
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Add Environment Variable to ${application.name}`} />

            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    {
                        label: "Applications",
                        href: route("applications.index"),
                    },
                    {
                        label: application.name,
                        href: route("applications.show", application.id),
                    },
                    { label: "New Environment Variable" },
                ]}
            />

            {/* Hero Header */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="relative px-6 py-8 sm:px-8 md:flex md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            New Environment Variable
                        </h1>
                        <p className="mt-2 max-w-2xl text-blue-100">
                            Add a new environment variable to{" "}
                            <span className="font-semibold">
                                {application.name}
                            </span>
                        </p>
                    </div>
                    <Link href={route("applications.show", application.id)}>
                        <Button
                            variant="outline"
                            className="gap-1 bg-white/10 text-white backdrop-blur-sm border-white/20 hover:bg-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to
                            Application
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
                <Alert className="mb-6 border-green-200 bg-green-50 text-green-800 animate-in fade-in slide-in-from-top-5 duration-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                        Environment variable created successfully!
                    </AlertDescription>
                </Alert>
            )}

            {/* No Access Warning */}
            {!hasEnvAccess && (
                <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertDescription>
                        You don't have permission to create environment
                        variables for any environment. Contact your
                        administrator for access.
                    </AlertDescription>
                </Alert>
            )}

            {/* Main Form */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b bg-gray-50/80 px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl text-gray-800">
                                Environment Variable Details
                            </CardTitle>
                            <CardDescription>
                                Provide the details for this environment
                                variable
                            </CardDescription>
                        </div>
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                            <Variable className="h-5 w-5" />
                        </div>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6 p-6">
                        {/* Application info (read-only) */}
                        <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                            <div className="flex items-center space-x-3">
                                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                    <Database className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-blue-800">
                                        Application
                                    </div>
                                    <div className="text-base font-semibold text-blue-900">
                                        {application.name}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="name"
                                    className="text-sm font-medium"
                                >
                                    Variable Name{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 cursor-help text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                            <p className="w-60 text-xs">
                                                Use uppercase letters with
                                                underscores. For example:
                                                DATABASE_URL, API_KEY, etc.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="relative">
                                <Input
                                    id="name"
                                    ref={nameInputRef}
                                    placeholder="VARIABLE_NAME"
                                    value={data.name}
                                    onChange={(e) => {
                                        const formattedName =
                                            formatVariableName(e.target.value);
                                        setData("name", formattedName);
                                    }}
                                    className={`font-mono pl-10 uppercase ${
                                        errors.name
                                            ? "border-red-300 ring-red-100"
                                            : data.name &&
                                              isNameValid(data.name)
                                            ? "border-green-300 ring-green-100"
                                            : "border-gray-300"
                                    } transition-all focus-visible:ring-blue-100 focus-visible:border-blue-500`}
                                    disabled={processing || !hasEnvAccess}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Variable className="h-4 w-4" />
                                </div>
                                {data.name &&
                                    isNameValid(data.name) &&
                                    !errors.name && (
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
                                <div className="mt-1 flex justify-between items-center">
                                    <p className="text-xs text-gray-500">
                                        Environment variable name (e.g.,
                                        DATABASE_URL)
                                    </p>
                                    {data.name && !isNameValid(data.name) && (
                                        <p className="text-xs text-amber-600 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            Use uppercase with underscores
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Environment Values Tabs */}
                        {hasEnvAccess && (
                            <div className="space-y-2 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium">
                                        Environment Values
                                    </h3>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 cursor-help text-gray-400" />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                                <p className="w-60 text-xs">
                                                    Define values for each
                                                    environment. Any sensitive
                                                    data will be encrypted.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                <Tabs
                                    value={activeTab}
                                    onValueChange={setActiveTab}
                                    className="w-full"
                                >
                                    <TabsList
                                        className={cn(
                                            "grid w-full",
                                            canCreateProduction &&
                                                canCreateStaging &&
                                                canCreateDevelopment
                                                ? "grid-cols-3"
                                                : (canCreateProduction &&
                                                      canCreateStaging) ||
                                                  (canCreateProduction &&
                                                      canCreateDevelopment) ||
                                                  (canCreateStaging &&
                                                      canCreateDevelopment)
                                                ? "grid-cols-2"
                                                : "grid-cols-1"
                                        )}
                                    >
                                        {canCreateDevelopment && (
                                            <TabsTrigger
                                                value="development"
                                                className="flex items-center gap-1.5"
                                            >
                                                <Server className="h-3.5 w-3.5 text-green-600" />
                                                <span>Development</span>
                                            </TabsTrigger>
                                        )}
                                        {canCreateStaging && (
                                            <TabsTrigger
                                                value="staging"
                                                className="flex items-center gap-1.5"
                                            >
                                                <Server className="h-3.5 w-3.5 text-amber-600" />
                                                <span>Staging</span>
                                            </TabsTrigger>
                                        )}
                                        {canCreateProduction && (
                                            <TabsTrigger
                                                value="production"
                                                className="flex items-center gap-1.5"
                                            >
                                                <Server className="h-3.5 w-3.5 text-red-600" />
                                                <span>Production</span>
                                            </TabsTrigger>
                                        )}
                                    </TabsList>
                                    {/* Development Value Tab */}
                                    {canCreateDevelopment && (
                                        <TabsContent
                                            value="development"
                                            className="pt-3"
                                        >
                                            <div className="space-y-2 border rounded-md p-4 bg-green-50/30 border-green-100">
                                                <div className="flex items-center justify-between">
                                                    <Label
                                                        htmlFor="development_value"
                                                        className="text-sm font-medium flex items-center gap-1.5"
                                                    >
                                                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                                        Development Value
                                                    </Label>
                                                </div>
                                                <div className="relative">
                                                    <Input
                                                        id="development_value"
                                                        type={
                                                            showDevelopmentValue
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        placeholder="Enter development value"
                                                        value={
                                                            data.development_value
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "development_value",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`pl-10 font-mono ${
                                                            errors.development_value
                                                                ? "border-red-300 ring-red-100"
                                                                : "border-gray-300"
                                                        } transition-all focus-visible:ring-green-100 focus-visible:border-green-500`}
                                                        disabled={processing}
                                                    />
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                        <Code className="h-4 w-4" />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        onClick={() =>
                                                            setShowDevelopmentValue(
                                                                !showDevelopmentValue
                                                            )
                                                        }
                                                    >
                                                        {showDevelopmentValue ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                                {errors.development_value ? (
                                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                                        <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                                                        {
                                                            errors.development_value
                                                        }
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-gray-500">
                                                        The value used in
                                                        development environment
                                                    </p>
                                                )}
                                            </div>
                                        </TabsContent>
                                    )}
                                    {/* Staging Value Tab */}
                                    {canCreateStaging && (
                                        <TabsContent
                                            value="staging"
                                            className="pt-3"
                                        >
                                            <div className="space-y-2 border rounded-md p-4 bg-amber-50/30 border-amber-100">
                                                <div className="flex items-center justify-between">
                                                    <Label
                                                        htmlFor="staging_value"
                                                        className="text-sm font-medium flex items-center gap-1.5"
                                                    >
                                                        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                                                        Staging Value
                                                    </Label>
                                                </div>
                                                <div className="relative">
                                                    <Input
                                                        id="staging_value"
                                                        type={
                                                            showStagingValue
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        placeholder="Enter staging value"
                                                        value={
                                                            data.staging_value
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "staging_value",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`pl-10 font-mono ${
                                                            errors.staging_value
                                                                ? "border-red-300 ring-red-100"
                                                                : "border-gray-300"
                                                        } transition-all focus-visible:ring-amber-100 focus-visible:border-amber-500`}
                                                        disabled={processing}
                                                    />
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                        <Code className="h-4 w-4" />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        onClick={() =>
                                                            setShowStagingValue(
                                                                !showStagingValue
                                                            )
                                                        }
                                                    >
                                                        {showStagingValue ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                                {errors.staging_value ? (
                                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                                        <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                                                        {errors.staging_value}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-gray-500">
                                                        The value used in
                                                        staging environment
                                                    </p>
                                                )}
                                            </div>
                                        </TabsContent>
                                    )}

                                    {/* Production Value Tab */}
                                    {canCreateProduction && (
                                        <TabsContent
                                            value="production"
                                            className="pt-3"
                                        >
                                            <div className="space-y-2 border rounded-md p-4 bg-red-50/30 border-red-100">
                                                <div className="flex items-center justify-between">
                                                    <Label
                                                        htmlFor="production_value"
                                                        className="text-sm font-medium flex items-center gap-1.5"
                                                    >
                                                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                                        Production Value
                                                    </Label>
                                                </div>
                                                <div className="relative">
                                                    <Input
                                                        id="production_value"
                                                        type={
                                                            showProductionValue
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        placeholder="Enter production value"
                                                        value={
                                                            data.production_value
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "production_value",
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`pl-10 font-mono ${
                                                            errors.production_value
                                                                ? "border-red-300 ring-red-100"
                                                                : "border-gray-300"
                                                        } transition-all focus-visible:ring-red-100 focus-visible:border-red-500`}
                                                        disabled={processing}
                                                    />
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                        <Code className="h-4 w-4" />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        onClick={() =>
                                                            setShowProductionValue(
                                                                !showProductionValue
                                                            )
                                                        }
                                                    >
                                                        {showProductionValue ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                                {errors.production_value ? (
                                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                                        <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                                                        {
                                                            errors.production_value
                                                        }
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-gray-500">
                                                        The value used in
                                                        production environment
                                                    </p>
                                                )}
                                            </div>
                                        </TabsContent>
                                    )}
                                </Tabs>

                                {/* Environment access notes */}
                                <div className="mt-4 flex items-center gap-2 text-sm">
                                    <ShieldCheck className="h-4 w-4 text-indigo-500" />
                                    <span className="text-gray-600">
                                        You have access to create variables for:{" "}
                                        <span className="font-medium">
                                            {[
                                                canCreateProduction &&
                                                    "Production",
                                                canCreateStaging && "Staging",
                                                canCreateDevelopment &&
                                                    "Development",
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex justify-end gap-3 border-t bg-gray-50/80 px-6 py-4">
                        <Link href={route("applications.show", application.id)}>
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
                                processing || !hasEnvAccess || !canSubmitForm()
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
                                    <Check className="h-4 w-4" />
                                    Create Variable
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </AuthenticatedLayout>
    );
};

export default EnvVariablesCreate;

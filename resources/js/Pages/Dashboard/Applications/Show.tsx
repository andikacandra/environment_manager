"use client";

import { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import type { Application, EnvType, EnvValue, PageProps } from "@/types";
import {
    Edit,
    Package,
    Key,
    Server,
    Clock,
    PlusCircle,
    Info,
    Search,
    FolderClosed,
    History,
    Copy,
    Eye,
    EyeOff,
    MoreHorizontal,
    AppWindow,
    Settings,
    Globe,
    CheckCircle,
    ArrowLeft,
    Trash,
    DownloadIcon,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowDownUp, ArrowDown, ArrowUp } from "lucide-react";
import { formatDate } from "@/lib/utils";
import EditEnvValueModal from "./Partials/EditEnvValueModal";
import DeleteEnvVariableModal from "./Partials/DeleteEnvVariableModal";
import DownloadEnvModal from "./Partials/DownloadEnvModal";

interface ApplicationsShowProps extends PageProps {
    application: Application;
    envTypes: EnvType[];
    canEditEnvVariables: boolean;
    canCreateEnvVariables: boolean;
    canDeleteEnvVariables: boolean;
    canViewDevelopment: boolean;
    canEditDevelopment: boolean;
    canViewStaging: boolean;
    canEditStaging: boolean;
    canViewProduction: boolean;
    canEditProduction: boolean;
    canEditEnvValues: boolean;
    canViewEnvValueChanges: boolean;
}

const ApplicationsShow = () => {
    const {
        application,
        canEditEnvVariables,
        canCreateEnvVariables,
        canDeleteEnvVariables,
        canViewDevelopment,
        canEditDevelopment,
        canViewStaging,
        canEditStaging,
        canViewProduction,
        canEditProduction,
        canEditEnvValues,
        canViewEnvValueChanges,
    } = usePage<ApplicationsShowProps>().props;

    const [searchVariables, setSearchVariables] = useState("");
    const [showSecretValues, setShowSecretValues] = useState<
        Record<string, boolean>
    >({});
    const [editingEnvValue, setEditingEnvValue] = useState<EnvValue | null>(
        null
    );
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const [sortField, setSortField] = useState("sequence");
    const [sortDirection, setSortDirection] = useState("asc");
    const [deletingVariable, setDeletingVariable] = useState<any>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

    const filteredEnvVariables =
        application.env_variables
            ?.filter((variable) =>
                variable.name
                    .toLowerCase()
                    .includes(searchVariables.toLowerCase())
            )
            .sort((a, b) => {
                const seqA = a.sequence === null ? 999999 : a.sequence;
                const seqB = b.sequence === null ? 999999 : b.sequence;
                return Number(seqA) - Number(seqB);
            }) || [];

    const toggleSecretVisibility = (id: string) => {
        setShowSecretValues((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const sortedEnvVariables = [...filteredEnvVariables].sort((a, b) => {
        if (sortField === "name") {
            return sortDirection === "asc"
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        } else if (sortField === "sequence") {
            if (a.sequence === null && b.sequence === null) return 0;
            if (a.sequence === null) return sortDirection === "asc" ? 1 : -1;
            if (b.sequence === null) return sortDirection === "asc" ? -1 : 1;
            return sortDirection === "asc"
                ? a.sequence - b.sequence
                : b.sequence - a.sequence;
        } else if (sortField === "created_at") {
            return sortDirection === "asc"
                ? new Date(a.created_at).getTime() -
                      new Date(b.created_at).getTime()
                : new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime();
        }
        return 0;
    });

    const copyToClipboard = (text: string, variableName: string) => {
        navigator.clipboard.writeText(text);
        setCopySuccess(variableName);
        setTimeout(() => setCopySuccess(null), 2000);
    };

    const handleViewHistory = (envVariable: any) => {
        router.get(
            route("applications.history", {
                application: application.id,
                envVariable: envVariable.id,
            })
        );
    };

    const handleEditEnvValue = (envValue: EnvValue) => {
        setEditingEnvValue(envValue);
        setIsEditDialogOpen(true);
    };

    const handleDeleteEnvVariable = (envVariable: any) => {
        setDeletingVariable(envVariable);
        setIsDeleteDialogOpen(true);
    };

    const renderEnvValue = (variable: any, envType: string) => {
        const envValue = variable.env_values?.find(
            (value: any) =>
                value.access_key?.env_type?.name?.toLowerCase() ===
                envType.toLowerCase()
        );

        if (!envValue) {
            return (
                <span className="text-gray-400 italic text-xs">Not set</span>
            );
        }

        const valueId = `${envType.charAt(0)}-${envValue.id}`;
        const isValueVisible = showSecretValues[valueId] || false;

        return (
            <div className="flex items-center space-x-1">
                <div
                    className={`font-mono text-sm ${
                        isValueVisible ? "" : "filter blur-[3px]"
                    } transition-all duration-200`}
                >
                    {envValue.value || (
                        <span className="text-gray-400 italic text-xs">
                            Empty
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-0.5">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-400 hover:text-gray-700"
                                    onClick={() =>
                                        toggleSecretVisibility(valueId)
                                    }
                                >
                                    {isValueVisible ? (
                                        <EyeOff className="h-3.5 w-3.5" />
                                    ) : (
                                        <Eye className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p className="text-xs">
                                    {isValueVisible
                                        ? "Hide value"
                                        : "Show value"}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {envValue.value && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-gray-400 hover:text-gray-700"
                                        onClick={() =>
                                            copyToClipboard(
                                                envValue.value,
                                                variable.name
                                            )
                                        }
                                    >
                                        {copySuccess === variable.name ? (
                                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p className="text-xs">Copy to clipboard</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    {canEditEnvValues && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-blue-500 hover:text-blue-700"
                                        onClick={() =>
                                            handleEditEnvValue(envValue)
                                        }
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p className="text-xs">Edit value</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Application: ${application.name}`} />

            <Breadcrumb
                items={[
                    {
                        label: "Applications",
                        href: route("applications.index"),
                    },
                    { label: application.name },
                ]}
            />

            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="relative px-6 py-8 sm:px-8 md:flex md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white">
                                <AppWindow className="h-5 w-5" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                {application.name}
                            </h1>
                        </div>

                        {application.description && (
                            <p className="mt-3 max-w-2xl text-blue-100">
                                {application.description}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href={route("applications.index")}>
                            <Button
                                variant="outline"
                                className="gap-1.5 bg-white/10 text-white backdrop-blur-sm border-white/20 hover:bg-white/20"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="env-variables" className="mb-8">
                <TabsList className="mb-6 grid w-full grid-cols-2 border rounded-lg p-1 bg-gray-50/80 shadow-sm">
                    <TabsTrigger
                        value="env-variables"
                        className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600"
                    >
                        <Package className="h-4 w-4" />
                        <span className="hidden sm:inline">
                            Environment Variables
                        </span>
                        <span className="sm:hidden">Variables</span>
                        <Badge
                            variant="secondary"
                            className="ml-1.5 bg-indigo-100 text-indigo-700 border-indigo-200 hidden md:flex"
                        >
                            {filteredEnvVariables.length}
                        </Badge>
                    </TabsTrigger>

                    <TabsTrigger
                        value="details"
                        className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600"
                    >
                        <Info className="h-4 w-4" />
                        <span>Details</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="env-variables">
                    <Card>
                        <CardHeader className="border-b bg-gradient-to-r from-gray-50/80 to-gray-100/80 px-6 py-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-semibold text-gray-800">
                                        Environment Variables
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-sm text-gray-600">
                                        Manage environment variables for this
                                        application
                                    </CardDescription>
                                </div>

                                <div className="flex items-center space-x-3">
                                    {canCreateEnvVariables && (
                                        <Link
                                            href={route(
                                                "applications.envVariables.create",
                                                {
                                                    application: application.id,
                                                }
                                            )}
                                        >
                                            <Button className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700">
                                                <PlusCircle className="h-4 w-4" />
                                                New Variable
                                            </Button>
                                        </Link>
                                    )}

                                    <Button
                                        variant="outline"
                                        className="gap-1.5 border-green-500 bg-white text-green-700 hover:bg-green-50"
                                        onClick={() =>
                                            setIsDownloadModalOpen(true)
                                        }
                                    >
                                        <DownloadIcon className="h-4 w-4" />
                                        Download .env
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="relative max-w-md w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search variables..."
                                        className="pl-10"
                                        value={searchVariables}
                                        onChange={(e) =>
                                            setSearchVariables(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            {filteredEnvVariables.length > 0 ? (
                                <div className="rounded-md border overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                                                    <TableHead
                                                        className="w-[100px] min-w-[100px] cursor-pointer"
                                                        onClick={() =>
                                                            handleSort(
                                                                "sequence"
                                                            )
                                                        }
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <span>
                                                                Sequence
                                                            </span>
                                                            {sortField ===
                                                                "sequence" &&
                                                                (sortDirection ===
                                                                "asc" ? (
                                                                    <ArrowUp className="h-3.5 w-3.5" />
                                                                ) : (
                                                                    <ArrowDown className="h-3.5 w-3.5" />
                                                                ))}
                                                            {sortField !==
                                                                "sequence" && (
                                                                <ArrowDownUp className="h-3.5 w-3.5 text-gray-300" />
                                                            )}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead
                                                        className="w-[180px] min-w-[180px] cursor-pointer"
                                                        onClick={() =>
                                                            handleSort("name")
                                                        }
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <span>Name</span>
                                                            {sortField ===
                                                                "name" &&
                                                                (sortDirection ===
                                                                "asc" ? (
                                                                    <ArrowUp className="h-3.5 w-3.5" />
                                                                ) : (
                                                                    <ArrowDown className="h-3.5 w-3.5" />
                                                                ))}
                                                            {sortField !==
                                                                "name" && (
                                                                <ArrowDownUp className="h-3.5 w-3.5 text-gray-300" />
                                                            )}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="min-w-[180px]">
                                                        <div className="flex items-center gap-1.5">
                                                            <Settings className="h-3.5 w-3.5 text-blue-500" />
                                                            <span>
                                                                Development
                                                            </span>
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="min-w-[180px]">
                                                        <div className="flex items-center gap-1.5">
                                                            <Globe className="h-3.5 w-3.5 text-yellow-500" />
                                                            <span>Staging</span>
                                                        </div>
                                                    </TableHead>
                                                    {canViewProduction && (
                                                        <TableHead className="min-w-[180px]">
                                                            <div className="flex items-center gap-1.5">
                                                                <Globe className="h-3.5 w-3.5 text-red-500" />
                                                                <span>
                                                                    Production
                                                                </span>
                                                            </div>
                                                        </TableHead>
                                                    )}

                                                    <TableHead
                                                        className="w-[150px] min-w-[150px] cursor-pointer"
                                                        onClick={() =>
                                                            handleSort(
                                                                "created_at"
                                                            )
                                                        }
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <span>
                                                                Created At
                                                            </span>
                                                            {sortField ===
                                                                "created_at" &&
                                                                (sortDirection ===
                                                                "asc" ? (
                                                                    <ArrowUp className="h-3.5 w-3.5" />
                                                                ) : (
                                                                    <ArrowDown className="h-3.5 w-3.5" />
                                                                ))}
                                                            {sortField !==
                                                                "created_at" && (
                                                                <ArrowDownUp className="h-3.5 w-3.5 text-gray-300" />
                                                            )}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="w-[80px]">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sortedEnvVariables.map(
                                                    (variable) => (
                                                        <TableRow
                                                            key={variable.id}
                                                            className="group"
                                                        >
                                                            <TableCell className="font-mono font-medium">
                                                                {variable.sequence ||
                                                                    "-"}
                                                            </TableCell>
                                                            <TableCell className="font-mono font-medium">
                                                                {variable.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                {renderEnvValue(
                                                                    variable,
                                                                    "development"
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {renderEnvValue(
                                                                    variable,
                                                                    "staging"
                                                                )}
                                                            </TableCell>
                                                            {canViewProduction && (
                                                                <TableCell>
                                                                    {renderEnvValue(
                                                                        variable,
                                                                        "production"
                                                                    )}
                                                                </TableCell>
                                                            )}
                                                            <TableCell className="text-sm text-gray-600">
                                                                {formatDate(
                                                                    variable.created_at
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex justify-end">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger
                                                                            asChild
                                                                        >
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8 opacity-70 group-hover:opacity-100"
                                                                            >
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuLabel>
                                                                                Actions
                                                                            </DropdownMenuLabel>
                                                                            {canEditEnvVariables && (
                                                                                <DropdownMenuItem
                                                                                    onClick={() =>
                                                                                        router.get(
                                                                                            route(
                                                                                                "applications.envVariables.edit",
                                                                                                {
                                                                                                    application:
                                                                                                        application.id,
                                                                                                    envVariable:
                                                                                                        variable.id,
                                                                                                }
                                                                                            )
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                                    Edit
                                                                                    Variable
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                            {canViewEnvValueChanges && (
                                                                                <DropdownMenuItem
                                                                                    onClick={() =>
                                                                                        handleViewHistory(
                                                                                            variable
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <History className="h-4 w-4 mr-2" />
                                                                                    View
                                                                                    History
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                            {canDeleteEnvVariables && (
                                                                                <>
                                                                                    <DropdownMenuSeparator />
                                                                                    <DropdownMenuItem
                                                                                        className="text-red-600"
                                                                                        onClick={() =>
                                                                                            handleDeleteEnvVariable(
                                                                                                variable
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <Trash className="h-4 w-4 mr-2" />
                                                                                        Delete
                                                                                        Variable
                                                                                    </DropdownMenuItem>
                                                                                </>
                                                                            )}
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                                        <Package className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                                        No Environment Variables
                                    </h3>
                                    <p className="text-gray-500 max-w-md mb-6">
                                        {searchVariables
                                            ? "No variables match your search criteria."
                                            : "This application doesn't have any environment variables yet."}
                                    </p>
                                    {canCreateEnvVariables && (
                                        <Link
                                            href={route(
                                                "applications.envVariables.create",
                                                {
                                                    application: application.id,
                                                }
                                            )}
                                        >
                                            <Button className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700">
                                                <PlusCircle className="h-4 w-4" />
                                                Add First Variable
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="details">
                    <Card className="w-full">
                        <CardHeader className="border-b bg-gray-50/80 px-6">
                            <CardTitle className="text-xl text-gray-800">
                                Application Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-8">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-gray-500">
                                            Application Name
                                        </h4>
                                        <p className="text-base font-medium text-gray-900">
                                            {application.name}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-gray-500">
                                            Group
                                        </h4>
                                        <p className="text-base font-medium text-gray-900 flex items-center gap-1.5">
                                            <FolderClosed className="h-4 w-4 text-blue-500" />
                                            {application.group.name}
                                        </p>
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <h4 className="text-sm font-medium text-gray-500">
                                            Description
                                        </h4>
                                        <p className="text-base text-gray-900">
                                            {application.description || (
                                                <span className="text-gray-400 italic">
                                                    No description provided
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t">
                                    <h4 className="text-sm font-medium text-gray-500 mb-4">
                                        Usage Statistics
                                    </h4>
                                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-3">
                                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                                                    <Package className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {application
                                                            .env_variables
                                                            ?.length || 0}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Environment Variables
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                                                    <Key className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {application.access_keys
                                                            ?.length || 0}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Access Keys
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                                                    <Server className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {application.env_variables?.reduce(
                                                            (acc, variable) =>
                                                                acc +
                                                                (variable
                                                                    .env_values
                                                                    ?.length ||
                                                                    0),
                                                            0
                                                        ) || 0}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Environment Values
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-medium text-gray-500">
                                            Application Timeline
                                        </h4>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 mt-0.5">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    Application Created
                                                </div>
                                                <div className="text-sm text-gray-500 mt-0.5">
                                                    {formatDate(
                                                        application.created_at
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 mt-0.5">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    Last Updated
                                                </div>
                                                <div className="text-sm text-gray-500 mt-0.5">
                                                    {formatDate(
                                                        application.updated_at
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-gray-50/80 px-6 py-4 flex justify-between items-center border-t">
                            <div className="text-sm text-gray-500">
                                ID:{" "}
                                <span className="font-mono">
                                    {application.id}
                                </span>
                            </div>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>

            {canEditEnvValues && (
                <EditEnvValueModal
                    isOpen={isEditDialogOpen}
                    onClose={() => {
                        setIsEditDialogOpen(false);
                        setEditingEnvValue(null);
                    }}
                    envValue={editingEnvValue}
                    applicationId={application.id}
                />
            )}

            {canDeleteEnvVariables && (
                <DeleteEnvVariableModal
                    isOpen={isDeleteDialogOpen}
                    onClose={() => {
                        setIsDeleteDialogOpen(false);
                        setDeletingVariable(null);
                    }}
                    envVariable={deletingVariable}
                    applicationId={application.id}
                />
            )}
            <DownloadEnvModal
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                application={application}
                permissions={{
                    canViewDevelopment,
                    canViewStaging,
                    canViewProduction,
                }}
            />
        </AuthenticatedLayout>
    );
};

export default ApplicationsShow;

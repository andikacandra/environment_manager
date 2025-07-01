import { useState, useMemo, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { EnvValueChange, PageProps } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    ArrowUpDown,
    Code,
    Eye,
    Filter,
    History,
    Search,
    Settings,
    Globe,
    Server,
    SlidersHorizontal,
    User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Breadcrumb } from "@/components/Breadcrumb";
import { cn, formatDate, formatTime } from "@/lib/utils";
import ClientPagination from "@/components/ClientPagination";
import ViewChangeModal from "./Partials/ViewChangeModal";

interface EnvValueChangesIndexProps extends PageProps {
    envValueChanges: EnvValueChange[];
    canViewDevelopment: boolean;
    canViewStaging: boolean;
    canViewProduction: boolean;
    isSuperAdmin: boolean;
}

const EnvValueChangesIndex = () => {
    const {
        envValueChanges,
        canViewDevelopment,
        canViewStaging,
        canViewProduction,
        isSuperAdmin,
    } = usePage<EnvValueChangesIndexProps>().props;
    console.log("EnvValueChangesIndex props:", envValueChanges);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string | null>(null);
    const [filterEnvironment, setFilterEnvironment] = useState<string | null>(
        null
    );
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<
        "created_at" | "variable" | "application" | "type" | "environment"
    >("created_at");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [selectedChange, setSelectedChange] = useState<EnvValueChange | null>(
        null
    );
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const ITEMS_PER_PAGE = 10;

    // Get unique change types for filtering
    const changeTypes = useMemo(() => {
        const types = new Set<string>();
        envValueChanges.forEach((change) => {
            types.add(change.type);
        });
        return Array.from(types);
    }, [envValueChanges]);

    // Get available environment types based on user permissions
    const availableEnvironments = useMemo(() => {
        const environments = [];
        if (canViewDevelopment) environments.push("Development");
        if (canViewStaging) environments.push("Staging");
        if (canViewProduction) environments.push("Production");
        return environments;
    }, [canViewDevelopment, canViewStaging, canViewProduction]);

    // Client-side filtering
    const filteredChanges = useMemo(() => {
        return envValueChanges.filter((change) => {
            const matchesSearch =
                searchTerm === "" ||
                change.env_value?.env_variable?.name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                change.env_value?.access_key?.key
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                change.env_value?.access_key?.application?.name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                change.user?.full_name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesType =
                filterType === null || change.type === filterType;

            const matchesEnvironment =
                filterEnvironment === null ||
                change.env_value?.access_key?.env_type?.name?.toLowerCase() ===
                    filterEnvironment.toLowerCase();

            // Only show changes for environments the user has permission to view
            const hasEnvironmentPermission =
                isSuperAdmin ||
                (change.env_value?.access_key?.env_type?.name?.toLowerCase() ===
                    "development" &&
                    canViewDevelopment) ||
                (change.env_value?.access_key?.env_type?.name?.toLowerCase() ===
                    "staging" &&
                    canViewStaging) ||
                (change.env_value?.access_key?.env_type?.name?.toLowerCase() ===
                    "production" &&
                    canViewProduction);

            return (
                matchesSearch &&
                matchesType &&
                matchesEnvironment &&
                hasEnvironmentPermission
            );
        });
    }, [
        envValueChanges,
        searchTerm,
        filterType,
        filterEnvironment,
        canViewDevelopment,
        canViewStaging,
        canViewProduction,
        isSuperAdmin,
    ]);

    // Client-side sorting
    const sortedChanges = useMemo(() => {
        return [...filteredChanges].sort((a, b) => {
            if (sortField === "created_at") {
                return sortDirection === "asc"
                    ? new Date(a.created_at).getTime() -
                          new Date(b.created_at).getTime()
                    : new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime();
            } else if (sortField === "variable") {
                return sortDirection === "asc"
                    ? (a.env_value?.env_variable?.name || "").localeCompare(
                          b.env_value?.env_variable?.name || ""
                      )
                    : (b.env_value?.env_variable?.name || "").localeCompare(
                          a.env_value?.env_variable?.name || ""
                      );
            } else if (sortField === "application") {
                return sortDirection === "asc"
                    ? (
                          a.env_value?.access_key?.application?.name || ""
                      ).localeCompare(
                          b.env_value?.access_key?.application?.name || ""
                      )
                    : (
                          b.env_value?.access_key?.application?.name || ""
                      ).localeCompare(
                          a.env_value?.access_key?.application?.name || ""
                      );
            } else if (sortField === "environment") {
                return sortDirection === "asc"
                    ? (
                          a.env_value?.access_key?.env_type?.name || ""
                      ).localeCompare(
                          b.env_value?.access_key?.env_type?.name || ""
                      )
                    : (
                          b.env_value?.access_key?.env_type?.name || ""
                      ).localeCompare(
                          a.env_value?.access_key?.env_type?.name || ""
                      );
            } else {
                // sort by type
                return sortDirection === "asc"
                    ? (a.type || "").localeCompare(b.type || "")
                    : (b.type || "").localeCompare(a.type || "");
            }
        });
    }, [filteredChanges, sortField, sortDirection]);

    // Client-side pagination
    const paginatedChanges = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedChanges.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedChanges, currentPage]);

    // Calculate total pages for pagination
    const totalPages = Math.ceil(sortedChanges.length / ITEMS_PER_PAGE);

    // Reset to first page when search term or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType, filterEnvironment]);

    // Handle sorting
    const handleSort = (
        field:
            | "created_at"
            | "variable"
            | "application"
            | "type"
            | "environment"
    ) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc"); // Default to desc when changing fields
        }
    };

    // Get badge color based on change type
    const getChangeTypeBadgeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case "create":
                return "bg-green-100 text-green-800 border-green-200";
            case "update":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "delete":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    // Get environment icon
    const getEnvironmentIcon = (envType: string | undefined) => {
        switch (envType?.toLowerCase()) {
            case "development":
                return <Settings className="h-3.5 w-3.5 text-green-500" />;
            case "staging":
                return <Globe className="h-3.5 w-3.5 text-yellow-500" />;
            case "production":
                return <Server className="h-3.5 w-3.5 text-red-500" />;
            default:
                return <Globe className="h-3.5 w-3.5 text-gray-500" />;
        }
    };

    // Get badge color for environment
    const getEnvironmentBadgeColor = (envType: string | undefined) => {
        switch (envType?.toLowerCase()) {
            case "development":
                return "bg-green-50 text-green-700 border-green-100";
            case "staging":
                return "bg-yellow-50 text-yellow-700 border-yellow-100";
            case "production":
                return "bg-red-50 text-red-700 border-red-100";
            default:
                return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    // View change details
    const viewChangeDetails = (change: EnvValueChange) => {
        setSelectedChange(change);
        setIsViewModalOpen(true);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Environment Value Changes" />

            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    {
                        label: "Applications",
                        href: route("applications.index"),
                    },
                    { label: "Environment Changes" },
                ]}
            />

            {/* Header Banner */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="relative z-10 px-6 py-8 sm:px-8 md:flex md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Environment Changes
                        </h1>
                        <p className="mt-2 max-w-2xl text-purple-100">
                            Track and audit changes made to environment
                            variables across all applications.
                        </p>
                    </div>
                </div>

                {/* Stats/Overview Cards */}
                <div className="relative z-10 mt-6 grid grid-cols-2 gap-4 px-6 pb-8 sm:px-8 sm:grid-cols-4">
                    <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <div className="text-sm font-medium text-white/70">
                            Total Changes
                        </div>
                        <div className="mt-1 flex items-baseline">
                            <span className="text-2xl font-semibold text-white">
                                {filteredChanges.length}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <div className="text-sm font-medium text-white/70">
                            Create Operations
                        </div>
                        <div className="mt-1 flex items-baseline">
                            <span className="text-2xl font-semibold text-white">
                                {
                                    filteredChanges.filter(
                                        (c) => c.type === "create"
                                    ).length
                                }
                            </span>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <div className="text-sm font-medium text-white/70">
                            Update Operations
                        </div>
                        <div className="mt-1 flex items-baseline">
                            <span className="text-2xl font-semibold text-white">
                                {
                                    filteredChanges.filter(
                                        (c) => c.type === "update"
                                    ).length
                                }
                            </span>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <div className="text-sm font-medium text-white/70">
                            Delete Operations
                        </div>
                        <div className="mt-1 flex items-baseline">
                            <span className="text-2xl font-semibold text-white">
                                {
                                    filteredChanges.filter(
                                        (c) => c.type === "delete"
                                    ).length
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Change Details Modal - Now using the separate component */}
            <ViewChangeModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                selectedChange={selectedChange}
            />

            {/* Main Content */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="border-b bg-gray-50/80 px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                type="search"
                                placeholder="Search changes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-white"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Environment type filter dropdown */}
                            {availableEnvironments.length > 1 && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 border-dashed gap-1"
                                        >
                                            <Globe className="h-4 w-4" />
                                            <span className="hidden sm:inline">
                                                {filterEnvironment ||
                                                    "All Environments"}
                                            </span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-[200px]"
                                    >
                                        <DropdownMenuItem
                                            onClick={() =>
                                                setFilterEnvironment(null)
                                            }
                                            className={
                                                filterEnvironment === null
                                                    ? "bg-gray-100"
                                                    : ""
                                            }
                                        >
                                            All Environments
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {availableEnvironments.map((env) => (
                                            <DropdownMenuItem
                                                key={env}
                                                onClick={() =>
                                                    setFilterEnvironment(env)
                                                }
                                                className={
                                                    filterEnvironment === env
                                                        ? "bg-gray-100"
                                                        : ""
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    {getEnvironmentIcon(env)}
                                                    {env}
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}

                            {/* Change type filter dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 border-dashed gap-1"
                                    >
                                        <SlidersHorizontal className="h-4 w-4" />
                                        <span className="hidden sm:inline">
                                            {filterType
                                                ? `Type: ${filterType}`
                                                : "All Types"}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-[200px]"
                                >
                                    <DropdownMenuItem
                                        onClick={() => setFilterType(null)}
                                        className={
                                            filterType === null
                                                ? "bg-gray-100"
                                                : ""
                                        }
                                    >
                                        All Types
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {changeTypes.map((type) => (
                                        <DropdownMenuItem
                                            key={type}
                                            onClick={() => setFilterType(type)}
                                            className={
                                                filterType === type
                                                    ? "bg-gray-100"
                                                    : ""
                                            }
                                        >
                                            {type.charAt(0).toUpperCase() +
                                                type.slice(1)}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setSearchTerm("");
                                    setFilterType(null);
                                    setFilterEnvironment(null);
                                    setSortField("created_at");
                                    setSortDirection("desc");
                                    setCurrentPage(1);
                                }}
                                title="Reset filters"
                                className="h-9 w-9"
                            >
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <div className="overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead
                                    className="cursor-pointer w-[15%]"
                                    onClick={() => handleSort("created_at")}
                                >
                                    <div className="flex items-center gap-1">
                                        Date & Time
                                        {sortField === "created_at" && (
                                            <ArrowUpDown
                                                className={cn(
                                                    "h-4 w-4 transition-transform",
                                                    sortDirection === "desc" &&
                                                        "transform -rotate-180"
                                                )}
                                            />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer"
                                    onClick={() => handleSort("variable")}
                                >
                                    <div className="flex items-center gap-1">
                                        Variable
                                        {sortField === "variable" && (
                                            <ArrowUpDown
                                                className={cn(
                                                    "h-4 w-4 transition-transform",
                                                    sortDirection === "desc" &&
                                                        "transform -rotate-180"
                                                )}
                                            />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer"
                                    onClick={() => handleSort("application")}
                                >
                                    <div className="flex items-center gap-1">
                                        Application
                                        {sortField === "application" && (
                                            <ArrowUpDown
                                                className={cn(
                                                    "h-4 w-4 transition-transform",
                                                    sortDirection === "desc" &&
                                                        "transform -rotate-180"
                                                )}
                                            />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer"
                                    onClick={() => handleSort("environment")}
                                >
                                    <div className="flex items-center gap-1">
                                        Environment
                                        {sortField === "environment" && (
                                            <ArrowUpDown
                                                className={cn(
                                                    "h-4 w-4 transition-transform",
                                                    sortDirection === "desc" &&
                                                        "transform -rotate-180"
                                                )}
                                            />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer"
                                    onClick={() => handleSort("type")}
                                >
                                    <div className="flex items-center gap-1">
                                        Type
                                        {sortField === "type" && (
                                            <ArrowUpDown
                                                className={cn(
                                                    "h-4 w-4 transition-transform",
                                                    sortDirection === "desc" &&
                                                        "transform -rotate-180"
                                                )}
                                            />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedChanges.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center h-32"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-1 text-sm text-gray-500">
                                            <History className="h-8 w-8 text-gray-400" />
                                            <h3 className="font-medium">
                                                No environment changes found
                                            </h3>
                                            <p>
                                                {searchTerm ||
                                                filterType ||
                                                filterEnvironment
                                                    ? "Try adjusting your filters"
                                                    : "No changes have been recorded yet."}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedChanges.map((change) => (
                                    <TableRow
                                        key={change.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {formatDate(
                                                        change.created_at
                                                    )}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatTime(
                                                        change.created_at
                                                    )}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Code className="h-4 w-4 text-indigo-600" />
                                                <span className="font-medium">
                                                    {
                                                        change.env_value
                                                            ?.env_variable?.name
                                                    }
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {change.env_value?.access_key
                                                ?.application?.id ? (
                                                <Link
                                                    href={route(
                                                        "applications.show",
                                                        change.env_value
                                                            .access_key
                                                            .application.id
                                                    )}
                                                    className="hover:text-indigo-600"
                                                >
                                                    {
                                                        change.env_value
                                                            ?.access_key
                                                            ?.application?.name
                                                    }
                                                </Link>
                                            ) : (
                                                <span>
                                                    {change.env_value
                                                        ?.env_variable
                                                        ?.application?.name ||
                                                        "N/A"}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    getEnvironmentBadgeColor(
                                                        change.env_value
                                                            ?.access_key
                                                            ?.env_type?.name
                                                    ),
                                                    "flex items-center gap-1.5 w-fit"
                                                )}
                                            >
                                                {getEnvironmentIcon(
                                                    change.env_value?.access_key
                                                        ?.env_type?.name
                                                )}
                                                {change.env_value?.access_key
                                                    ?.env_type?.name ||
                                                    "Unknown"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    getChangeTypeBadgeColor(
                                                        change.type
                                                    )
                                                )}
                                            >
                                                {change.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="rounded-full w-6 h-6 bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-medium">
                                                    {change.user?.full_name
                                                        ?.charAt(0)
                                                        .toUpperCase() || "U"}
                                                </div>
                                                <span className="text-sm truncate max-w-[120px]">
                                                    {change.user?.full_name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8"
                                                            onClick={() =>
                                                                viewChangeDetails(
                                                                    change
                                                                )
                                                            }
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            <span className="sr-only">
                                                                View Details
                                                            </span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>
                                                            View Change Details
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {paginatedChanges.length > 0 && (
                    <div className="border-t">
                        {/* Use the shared ClientPagination component */}
                        <ClientPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={sortedChanges.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            setCurrentPage={setCurrentPage}
                        />
                    </div>
                )}
            </Card>
        </AuthenticatedLayout>
    );
};

export default EnvValueChangesIndex;

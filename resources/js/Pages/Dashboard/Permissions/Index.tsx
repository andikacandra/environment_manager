"use client";

import { useState, useEffect, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import type { Permission, PageProps } from "@/types";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Search,
    Plus,
    Lock,
    Trash2,
    Pencil,
    Filter,
    ArrowUpDown,
    SlidersHorizontal,
    LockKeyhole,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardHeader } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import ClientPagination from "@/components/ClientPagination";

// Import modals
import CreatePermissionModal from "./Partials/CreatePermissionModal";
import EditPermissionModal from "./Partials/EditPermissionModal";
import DeletePermissionModal from "./Partials/DeletePermissionModal";

interface PermissionsIndexProps extends PageProps {
    permissions: Permission[];
    canCreatePermissions: boolean;
    canEditPermissions: boolean;
    canDeletePermissions: boolean;
}

const PermissionsIndex = () => {
    const {
        permissions,
        canCreatePermissions,
        canEditPermissions,
        canDeletePermissions,
    } = usePage<PermissionsIndexProps>().props;

    // State for modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Edit permission modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editPermissionId, setEditPermissionId] = useState<number | null>(
        null
    );
    const [editPermissionName, setEditPermissionName] = useState("");
    const [editPermissionGuard, setEditPermissionGuard] = useState("");

    // Delete permission modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletePermissionId, setDeletePermissionId] = useState<number | null>(
        null
    );
    const [deletePermissionName, setDeletePermissionName] = useState("");

    // State for client-side filtering and pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<
        "name" | "guard_name" | "created_at"
    >("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    const ITEMS_PER_PAGE = 10;

    // Open edit modal with permission data
    const openEditModal = (permission: Permission) => {
        setEditPermissionId(permission.id);
        setEditPermissionName(permission.name);
        setEditPermissionGuard(permission.guard_name);
        setIsEditModalOpen(true);
    };

    // Open delete modal with permission data
    const openDeleteModal = (id: number, name: string) => {
        setDeletePermissionId(id);
        setDeletePermissionName(name);
        setIsDeleteModalOpen(true);
    };

    // Client-side filtering
    const filteredPermissions = useMemo(() => {
        return permissions.filter(
            (permission) =>
                permission.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                permission.guard_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
        );
    }, [permissions, searchTerm]);

    // Client-side sorting
    const sortedPermissions = useMemo(() => {
        return [...filteredPermissions].sort((a, b) => {
            if (sortField === "name") {
                return sortDirection === "asc"
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            } else if (sortField === "guard_name") {
                return sortDirection === "asc"
                    ? a.guard_name.localeCompare(b.guard_name)
                    : b.guard_name.localeCompare(a.guard_name);
            } else {
                return sortDirection === "asc"
                    ? new Date(a.created_at).getTime() -
                          new Date(b.created_at).getTime()
                    : new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime();
            }
        });
    }, [filteredPermissions, sortField, sortDirection]);

    // Client-side pagination
    const paginatedPermissions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedPermissions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedPermissions, currentPage]);

    // Calculate total pages for pagination
    const totalPages = Math.ceil(sortedPermissions.length / ITEMS_PER_PAGE);

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleSort = (field: "name" | "guard_name" | "created_at") => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Group permissions by category
    const permissionsByCategory = useMemo(() => {
        const grouped: Record<string, number> = {};

        permissions.forEach((permission) => {
            // Extract category from permission name (e.g., "create-users" -> "users")
            const parts = permission.name.split("-");
            if (parts.length >= 2) {
                const category = parts[1];
                if (!grouped[category]) {
                    grouped[category] = 0;
                }
                grouped[category]++;
            } else {
                if (!grouped.other) {
                    grouped.other = 0;
                }
                grouped.other++;
            }
        });

        return grouped;
    }, [permissions]);

    // Get guard counts
    const guardCounts = useMemo(() => {
        const counts: Record<string, number> = {};

        permissions.forEach((permission) => {
            if (!counts[permission.guard_name]) {
                counts[permission.guard_name] = 0;
            }
            counts[permission.guard_name]++;
        });

        return counts;
    }, [permissions]);

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Get a color for permission badge based on guard name
    const getGuardColorClass = (guardName: string) => {
        const guardColors: { [key: string]: string } = {
            web: "bg-blue-100 text-blue-800 border-blue-200",
            api: "bg-green-100 text-green-800 border-green-200",
            sanctum: "bg-purple-100 text-purple-800 border-purple-200",
        };

        return (
            guardColors[guardName.toLowerCase()] ||
            "bg-gray-100 text-gray-800 border-gray-200"
        );
    };

    // Get permission category
    const getPermissionCategory = (permissionName: string): string => {
        const parts = permissionName.split("-");
        if (parts.length >= 2) {
            return parts[1];
        }
        return "other";
    };

    // Get permission action
    const getPermissionAction = (permissionName: string): string => {
        const parts = permissionName.split("-");
        if (parts.length >= 1) {
            return parts[0];
        }
        return permissionName;
    };

    // Get color for permission action
    const getActionColorClass = (action: string) => {
        const actionColors: { [key: string]: string } = {
            create: "bg-green-100 text-green-800 border-green-200",
            edit: "bg-blue-100 text-blue-800 border-blue-200",
            update: "bg-blue-100 text-blue-800 border-blue-200",
            delete: "bg-red-100 text-red-800 border-red-200",
            view: "bg-indigo-100 text-indigo-800 border-indigo-200",
            list: "bg-purple-100 text-purple-800 border-purple-200",
            manage: "bg-amber-100 text-amber-800 border-amber-200",
        };

        return (
            actionColors[action.toLowerCase()] ||
            "bg-gray-100 text-gray-800 border-gray-200"
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Permissions" />

            {/* Breadcrumb */}
            <Breadcrumb items={[{ label: "Permissions" }]} />

            {/* Modals */}
            <CreatePermissionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <EditPermissionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                permissionId={editPermissionId}
                permissionName={editPermissionName}
                permissionGuard={editPermissionGuard}
            />

            <DeletePermissionModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                permissionId={deletePermissionId}
                permissionName={deletePermissionName}
            />

            {/* Header Banner */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="relative z-10 px-6 py-8 sm:px-8 md:flex md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Permissions
                        </h1>
                        <p className="mt-2 max-w-2xl text-emerald-100">
                            Manage system permissions to define granular access
                            control for users and roles.
                        </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-3">
                        {canCreatePermissions && (
                            <Button
                                className="shadow-md bg-white text-emerald-600 hover:bg-gray-100 gap-1.5 font-medium"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                <Plus className="h-4 w-4" />
                                <span>Create Permission</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats/Overview Cards */}
                <div className="relative z-10 mt-6 grid grid-cols-2 gap-4 px-6 pb-8 sm:px-8 sm:grid-cols-4">
                    <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <div className="text-sm font-medium text-white/70">
                            Total Permissions
                        </div>
                        <div className="mt-1 flex items-baseline">
                            <span className="text-2xl font-semibold text-white">
                                {permissions.length}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <div className="text-sm font-medium text-white/70">
                            Categories
                        </div>
                        <div className="mt-1 flex items-baseline">
                            <span className="text-2xl font-semibold text-white">
                                {Object.keys(permissionsByCategory).length}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <div className="text-sm font-medium text-white/70">
                            Web Guard
                        </div>
                        <div className="mt-1 flex items-baseline">
                            <span className="text-2xl font-semibold text-white">
                                {guardCounts["web"] || 0}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <div className="text-sm font-medium text-white/70">
                            API Guard
                        </div>
                        <div className="mt-1 flex items-baseline">
                            <span className="text-2xl font-semibold text-white">
                                {guardCounts["api"] || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="border-b bg-gray-50/80 px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                type="search"
                                placeholder="Search permissions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-white"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 border-dashed gap-1"
                                    >
                                        <SlidersHorizontal className="h-4 w-4" />
                                        <span className="hidden sm:inline">
                                            View Options
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-[200px]"
                                >
                                    <DropdownMenuItem
                                        onClick={() => setSortField("name")}
                                    >
                                        Sort by name
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            setSortField("guard_name")
                                        }
                                    >
                                        Sort by guard
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            setSortField("created_at")
                                        }
                                    >
                                        Sort by creation date
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => setSortDirection("asc")}
                                    >
                                        Ascending order
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setSortDirection("desc")}
                                    >
                                        Descending order
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setSearchTerm("");
                                    setSortField("name");
                                    setSortDirection("asc");
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
                                    className="w-[40%] cursor-pointer"
                                    onClick={() => handleSort("name")}
                                >
                                    <div className="flex items-center gap-1">
                                        Permission Name
                                        {sortField === "name" && (
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
                                    onClick={() => handleSort("guard_name")}
                                >
                                    <div className="flex items-center gap-1">
                                        Guard
                                        {sortField === "guard_name" && (
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
                                <TableHead>Category</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead
                                    className="cursor-pointer"
                                    onClick={() => handleSort("created_at")}
                                >
                                    <div className="flex items-center gap-1">
                                        Created
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
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedPermissions.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center h-32"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-1 text-sm text-gray-500">
                                            <Lock className="h-8 w-8 text-gray-400" />
                                            <h3 className="font-medium">
                                                No permissions found
                                            </h3>
                                            <p>
                                                {searchTerm
                                                    ? `No permissions match "${searchTerm}"`
                                                    : "There are no permissions defined yet."}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedPermissions.map((permission) => (
                                    <TableRow
                                        key={permission.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <TableCell>
                                            <div className="flex items-start gap-3">
                                                <div className="rounded-md bg-emerald-50 p-2 text-emerald-600">
                                                    <LockKeyhole className="h-5 w-5" />
                                                </div>
                                                <div className="font-medium">
                                                    {permission.name}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    getGuardColorClass(
                                                        permission.guard_name
                                                    )
                                                )}
                                            >
                                                {permission.guard_name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className="bg-gray-50"
                                            >
                                                {getPermissionCategory(
                                                    permission.name
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    getActionColorClass(
                                                        getPermissionAction(
                                                            permission.name
                                                        )
                                                    )
                                                )}
                                            >
                                                {getPermissionAction(
                                                    permission.name
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm">
                                            {formatDate(permission.created_at)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {canEditPermissions && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 gap-1"
                                                        onClick={() =>
                                                            openEditModal(
                                                                permission
                                                            )
                                                        }
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                                            Edit
                                                        </span>
                                                    </Button>
                                                )}

                                                {canDeletePermissions && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 border-red-200 text-red-600 hover:bg-red-50 gap-1"
                                                        onClick={() =>
                                                            openDeleteModal(
                                                                permission.id,
                                                                permission.name
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                                            Delete
                                                        </span>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {paginatedPermissions.length > 0 && (
                    <div className="border-t">
                        <ClientPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={sortedPermissions.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            setCurrentPage={setCurrentPage}
                        />
                    </div>
                )}
            </Card>
        </AuthenticatedLayout>
    );
};

export default PermissionsIndex;

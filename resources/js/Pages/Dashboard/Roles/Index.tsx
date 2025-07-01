"use client";

import { useState, useMemo } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import type { Role, PageProps } from "@/types";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Search,
    Plus,
    Shield,
    UserCircle,
    Trash2,
    Pencil,
    Filter,
    ArrowUpDown,
    SlidersHorizontal,
    Lock,
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
import CreateRoleModal from "./Partials/CreateRoleModal";
import EditRoleModal from "./Partials/EditRoleModal";
import DeleteRoleModal from "./Partials/DeleteRoleModal";

interface RolesIndexProps extends PageProps {
    roles: Role[];
    canViewRoles: boolean;
    canCreateRoles: boolean;
    canEditRoles: boolean;
    canDeleteRoles: boolean;
}

const RolesIndex = () => {
    const {
        roles,
        canViewRoles,
        canCreateRoles,
        canEditRoles,
        canDeleteRoles,
    } = usePage<RolesIndexProps>().props;

    // Role creation modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Role edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editRoleId, setEditRoleId] = useState<number | null>(null);
    const [editRoleName, setEditRoleName] = useState("");

    // Role delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteRoleId, setDeleteRoleId] = useState("");
    const [deleteRoleName, setDeleteRoleName] = useState("");

    // State for client-side filtering and pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<
        "name" | "guard_name" | "created_at"
    >("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    const ITEMS_PER_PAGE = 10;

    // Open edit modal with role data
    const openEditModal = (role: Role) => {
        setEditRoleId(Number(role.id));
        setEditRoleName(role.name);
        setIsEditModalOpen(true);
    };

    // Open delete modal with role data
    const openDeleteModal = (id: string, name: string) => {
        setDeleteRoleId(id);
        setDeleteRoleName(name);
        setIsDeleteModalOpen(true);
    };

    // Client-side filtering
    const filteredRoles = useMemo(() => {
        return roles.filter(
            (role) =>
                role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                role.guard_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [roles, searchTerm]);

    // Client-side sorting
    const sortedRoles = useMemo(() => {
        return [...filteredRoles].sort((a, b) => {
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
    }, [filteredRoles, sortField, sortDirection]);

    // Client-side pagination
    const paginatedRoles = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedRoles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedRoles, currentPage]);

    // Calculate total pages for pagination
    const totalPages = Math.ceil(sortedRoles.length / ITEMS_PER_PAGE);

    const handleSort = (field: "name" | "guard_name" | "created_at") => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Generate a color for role badge based on name
    const getRoleColorClass = (roleName: string) => {
        const roleColors: { [key: string]: string } = {
            admin: "bg-red-100 text-red-800 border-red-200",
            administrator: "bg-red-100 text-red-800 border-red-200",
            editor: "bg-blue-100 text-blue-800 border-blue-200",
            manager: "bg-purple-100 text-purple-800 border-purple-200",
            user: "bg-green-100 text-green-800 border-green-200",
            viewer: "bg-gray-100 text-gray-800 border-gray-200",
            guest: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };

        return (
            roleColors[roleName.toLowerCase()] ||
            "bg-indigo-100 text-indigo-800 border-indigo-200"
        );
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="User Roles" />

            {/* Breadcrumb */}
            <Breadcrumb items={[{ label: "Roles" }]} />

            {/* Modals */}
            <CreateRoleModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <EditRoleModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                roleId={editRoleId}
                roleName={editRoleName}
            />

            <DeleteRoleModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                roleId={deleteRoleId}
                roleName={deleteRoleName}
            />

            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="relative z-10 px-6 py-8 sm:px-8 md:flex md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            User Roles
                        </h1>
                        <p className="mt-2 max-w-2xl text-indigo-100">
                            Manage system roles and their associated permissions
                            to control user access across the platform.
                        </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-3">
                        {canCreateRoles && (
                            <Button
                                className="shadow-md bg-white text-indigo-600 hover:bg-gray-100 gap-1.5 font-medium"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                <Plus className="h-4 w-4" />
                                <span>Create Role</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats/Overview Cards */}
                <div className="relative z-10 mt-6 grid grid-cols-2 gap-4 px-6 pb-8 sm:px-8 sm:grid-cols-4">
                    <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <div className="text-sm font-medium text-white/70">
                            Total Roles
                        </div>
                        <div className="mt-1 flex items-baseline">
                            <span className="text-2xl font-semibold text-white">
                                {roles.length}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <div className="text-sm font-medium text-white/70">
                            Admin Roles
                        </div>
                        <div className="mt-1 flex items-baseline">
                            <span className="text-2xl font-semibold text-white">
                                {
                                    roles.filter(
                                        (role) =>
                                            role.name
                                                .toLowerCase()
                                                .includes("admin") ||
                                            role.name.toLowerCase() === "super"
                                    ).length
                                }
                            </span>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <div className="text-sm font-medium text-white/70">
                            System Roles
                        </div>
                        <div className="mt-1 flex items-baseline">
                            <span className="text-2xl font-semibold text-white">
                                {
                                    roles.filter(
                                        (role) => role.guard_name === "web"
                                    ).length
                                }
                            </span>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                        <div className="text-sm font-medium text-white/70">
                            API Roles
                        </div>
                        <div className="mt-1 flex items-baseline">
                            <span className="text-2xl font-semibold text-white">
                                {
                                    roles.filter(
                                        (role) => role.guard_name === "api"
                                    ).length
                                }
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
                                placeholder="Search roles..."
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
                                        Role Name
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
                                <TableHead>Users</TableHead>
                                <TableHead>Permissions</TableHead>
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
                            {paginatedRoles.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center h-32"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-1 text-sm text-gray-500">
                                            <Shield className="h-8 w-8 text-gray-400" />
                                            <h3 className="font-medium">
                                                No roles found
                                            </h3>
                                            <p>
                                                {searchTerm
                                                    ? `No roles match "${searchTerm}"`
                                                    : "There are no roles defined yet."}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedRoles.map((role) => (
                                    <TableRow
                                        key={role.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <TableCell>
                                            <div className="flex items-start gap-3">
                                                <div className="rounded-md bg-indigo-50 p-2 text-indigo-600">
                                                    <Shield className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <Link
                                                        href={route(
                                                            "roles.show",
                                                            role.id
                                                        )}
                                                        className="font-medium text-gray-900 hover:text-indigo-600"
                                                    >
                                                        {role.name}
                                                    </Link>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "ml-2 font-normal",
                                                            getRoleColorClass(
                                                                role.name
                                                            )
                                                        )}
                                                    >
                                                        {role.name}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className="bg-gray-50"
                                            >
                                                {role.guard_name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <UserCircle className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm">
                                                    {role.users?.length || 0}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Lock className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm">
                                                    {role.permissions?.length ||
                                                        0}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm">
                                            {formatDate(role.created_at)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {canViewRoles && (
                                                    <Link
                                                        href={route(
                                                            "roles.show",
                                                            role.id
                                                        )}
                                                    >
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 gap-1 bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                                                        >
                                                            <Shield className="h-3.5 w-3.5" />
                                                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                                                View
                                                            </span>
                                                        </Button>
                                                    </Link>
                                                )}

                                                {canEditRoles && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 gap-1"
                                                        onClick={() =>
                                                            openEditModal(role)
                                                        }
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                                            Edit
                                                        </span>
                                                    </Button>
                                                )}

                                                {canDeleteRoles &&
                                                    role.name.toLowerCase() !==
                                                        "admin" &&
                                                    role.name.toLowerCase() !==
                                                        "administrator" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 border-red-200 text-red-600 hover:bg-red-50 gap-1"
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    role.id,
                                                                    role.name
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

                {paginatedRoles.length > 0 && (
                    <div className="border-t">
                        <ClientPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={sortedRoles.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            setCurrentPage={setCurrentPage}
                        />
                    </div>
                )}
            </Card>
        </AuthenticatedLayout>
    );
};

export default RolesIndex;

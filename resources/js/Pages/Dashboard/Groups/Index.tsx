"use client";

import { useState, useMemo } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import type { Group, PageProps } from "@/types";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Edit,
    Eye,
    Plus,
    Search,
    Trash,
    Users,
    ArrowUpDown,
    CalendarDays,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";
import ClientPagination from "@/components/ClientPagination";
import DeleteGroupModal from "./Partials/DeleteGroupModal";

interface GroupsPageProps extends PageProps {
    groups: Group[];
    canCreateGroup: boolean;
    canEditGroup: boolean;
    canDeleteGroup: boolean;
}

const GroupsIndex = () => {
    const { groups, canCreateGroup, canEditGroup, canDeleteGroup } =
        usePage<GroupsPageProps>().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<"name" | "created_at">("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<{
        id: string;
        name: string;
    } | null>(null);

    // Client-side filtering
    const filteredGroups = useMemo(() => {
        return groups.filter(
            (group) =>
                group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (group.description &&
                    group.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()))
        );
    }, [groups, searchTerm]);

    const sortedGroups = useMemo(() => {
        return [...filteredGroups].sort((a, b) => {
            if (sortField === "name") {
                return sortDirection === "asc"
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            } else {
                return sortDirection === "asc"
                    ? new Date(a.created_at).getTime() -
                          new Date(b.created_at).getTime()
                    : new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime();
            }
        });
    }, [filteredGroups, sortField, sortDirection]);

    const paginatedGroups = useMemo(() => {
        const startIndex = (currentPage - 1) * 10;
        return sortedGroups.slice(startIndex, startIndex + 10);
    }, [sortedGroups, currentPage]);

    const handleSort = (field: "name" | "created_at") => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const itemsPerPage = 10;
    const totalPages = Math.ceil(sortedGroups.length / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, sortedGroups.length);

    const handleDeleteClick = (id: string, name: string) => {
        setGroupToDelete({ id, name });
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setGroupToDelete(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Groups" />
            {/* Breadcrumb */}
            <Breadcrumb items={[{ label: "Groups" }]} />

            {/* Page Header */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-8 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Groups
                        </h1>
                        <p className="mt-1.5 max-w-2xl text-indigo-100">
                            Organize environments, manage team access, and
                            streamline deployment pipelines with groups.
                        </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-3">
                        {canCreateGroup && (
                            <Link href={route("groups.create")}>
                                <Button className="shadow-md bg-white text-indigo-600 hover:bg-gray-100 gap-1.5 font-medium">
                                    <Plus className="h-4 w-4" />
                                    <span>Create Group</span>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
                {/* Controls */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search by name or description..."
                            className="pl-9 pr-4 py-2 border-gray-200 focus-visible:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                >
                                    <ArrowUpDown className="h-4 w-4" /> Sort
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="px-3 py-2 text-xs font-medium text-gray-500">
                                    Sort groups by
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => handleSort("name")}
                                >
                                    Name{" "}
                                    {sortField === "name" &&
                                        (sortDirection === "asc" ? "↑" : "↓")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleSort("created_at")}
                                >
                                    Date Created{" "}
                                    {sortField === "created_at" &&
                                        (sortDirection === "asc" ? "↑" : "↓")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500">
                        Showing {startItem} to {endItem} of{" "}
                        {sortedGroups.length} groups
                    </div>
                </div>

                {/* Groups Content */}
                {sortedGroups.length > 0 ? (
                    <>
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                                            <th
                                                className="px-4 py-3 font-semibold cursor-pointer"
                                                onClick={() =>
                                                    handleSort("name")
                                                }
                                            >
                                                <div className="flex items-center">
                                                    Name
                                                    {sortField === "name" && (
                                                        <span className="ml-1">
                                                            {sortDirection ===
                                                            "asc"
                                                                ? "↑"
                                                                : "↓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Members
                                            </th>
                                            <th className="hidden px-4 py-3 font-semibold md:table-cell">
                                                Description
                                            </th>
                                            <th
                                                className="hidden px-4 py-3 font-semibold md:table-cell cursor-pointer"
                                                onClick={() =>
                                                    handleSort("created_at")
                                                }
                                            >
                                                <div className="flex items-center">
                                                    Created
                                                    {sortField ===
                                                        "created_at" && (
                                                        <span className="ml-1">
                                                            {sortDirection ===
                                                            "asc"
                                                                ? "↑"
                                                                : "↓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 text-right font-semibold">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {paginatedGroups.map((group) => (
                                            <tr
                                                key={group.id}
                                                className="hover:bg-gray-50/50"
                                            >
                                                <td className="whitespace-nowrap px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <Link
                                                                href={route(
                                                                    "groups.show",
                                                                    group.id
                                                                )}
                                                                className="font-medium text-gray-900 hover:text-indigo-600"
                                                            >
                                                                {group.name}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                                                    >
                                                        {group.group_members
                                                            ?.length || 0}{" "}
                                                        members
                                                    </Badge>
                                                </td>
                                                <td className="hidden px-4 py-3 text-gray-600 md:table-cell">
                                                    {group.description ? (
                                                        <span className="line-clamp-1">
                                                            {group.description}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">
                                                            No description
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="hidden whitespace-nowrap px-4 py-3 text-gray-500 md:table-cell">
                                                    <div className="flex items-center gap-1.5">
                                                        <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                                                        <span>
                                                            {formatDate(
                                                                group.created_at
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0 text-gray-500 hover:text-indigo-600"
                                                                        onClick={() =>
                                                                            router.visit(
                                                                                route(
                                                                                    "groups.show",
                                                                                    group.id
                                                                                )
                                                                            )
                                                                        }
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                        <span className="sr-only">
                                                                            View
                                                                        </span>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>
                                                                        View
                                                                        group
                                                                        details
                                                                    </p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        {canEditGroup && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0 text-gray-500 hover:text-indigo-600"
                                                                            onClick={() =>
                                                                                router.visit(
                                                                                    route(
                                                                                        "groups.edit",
                                                                                        group.id
                                                                                    )
                                                                                )
                                                                            }
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                            <span className="sr-only">
                                                                                Edit
                                                                            </span>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>
                                                                            Edit
                                                                            group
                                                                        </p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}

                                                        {canDeleteGroup && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                                                                            onClick={() =>
                                                                                handleDeleteClick(
                                                                                    group.id,
                                                                                    group.name
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash className="h-4 w-4" />
                                                                            <span className="sr-only">
                                                                                Delete
                                                                            </span>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>
                                                                            Delete
                                                                            group
                                                                        </p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <ClientPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={sortedGroups.length}
                            itemsPerPage={itemsPerPage}
                            setCurrentPage={setCurrentPage}
                        />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                            <Users className="h-8 w-8 text-indigo-500" />
                        </div>
                        <h3 className="mb-1 text-lg font-medium">
                            No groups found
                        </h3>
                        <p className="mb-6 max-w-md text-gray-500">
                            {searchTerm
                                ? "Try adjusting your search terms or filters"
                                : "Create your first group to start organizing your environments"}
                        </p>
                        {canCreateGroup && !searchTerm && (
                            <Link href={route("groups.create")}>
                                <Button className="shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
                                    <Plus className="h-4 w-4" /> Create Your
                                    First Group
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
            {groupToDelete && (
                <DeleteGroupModal
                    isOpen={isDeleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    groupId={groupToDelete.id}
                    groupName={groupToDelete.name}
                />
            )}
        </AuthenticatedLayout>
    );
};

export default GroupsIndex;

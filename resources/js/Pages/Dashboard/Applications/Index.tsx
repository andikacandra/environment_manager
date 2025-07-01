"use client";

import { useState, useEffect, useMemo } from "react";
import { Head, router, usePage, Link } from "@inertiajs/react";
import type { Application, PageProps, Group } from "@/types";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Search,
    Plus,
    ArrowUpDown,
    Eye,
    Edit,
    Trash,
    Code,
    FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Badge } from "@/components/ui/badge";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
// Import the shared ClientPagination component
import ClientPagination from "@/components/ClientPagination";

interface ApplicationsPageProps extends PageProps {
    applications: (Application & {
        userCanView: boolean;
        userCanEdit: boolean;
        userCanDelete: boolean;
    })[];
    canCreateApplication: boolean;
    isSuperAdmin: boolean;
}

const ApplicationsIndex = () => {
    const { applications, canCreateApplication, isSuperAdmin } =
        usePage<ApplicationsPageProps>().props;

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<"name" | "created_at">("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [isLoading, setIsLoading] = useState(false);
    const [groupFilter, setGroupFilter] = useState<number | "all">("all");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [applicationToDelete, setApplicationToDelete] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const ITEMS_PER_PAGE = 10;

    const handleDeleteRequest = (id: string, name: string) => {
        setApplicationToDelete({ id, name });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (applicationToDelete) {
            router.delete(
                route("applications.destroy", applicationToDelete.id)
            );
            setIsDeleteModalOpen(false);
            setApplicationToDelete(null);
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setApplicationToDelete(null);
    };

    // Get unique groups from applications
    const groups = useMemo(() => {
        const uniqueGroups = new Map<string, Group>();

        applications.forEach((app) => {
            if (app.group && !uniqueGroups.has(app.group.id)) {
                uniqueGroups.set(app.group.id, app.group);
            }
        });

        return Array.from(uniqueGroups.values());
    }, [applications]);

    // Client-side filtering
    const filteredApplications = useMemo(() => {
        return applications.filter((application) => {
            const matchesSearch =
                application.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (application.description &&
                    application.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()));

            const matchesGroup =
                groupFilter === "all" ||
                (application.group &&
                    application.group.id.toString() === groupFilter.toString());

            return matchesSearch && matchesGroup;
        });
    }, [applications, searchTerm, groupFilter]);

    // Client-side sorting
    const sortedApplications = useMemo(() => {
        return [...filteredApplications].sort((a, b) => {
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
    }, [filteredApplications, sortField, sortDirection]);

    // Client-side pagination
    const paginatedApplications = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedApplications.slice(
            startIndex,
            startIndex + ITEMS_PER_PAGE
        );
    }, [sortedApplications, currentPage]);

    // Calculate total pages for pagination
    const totalPages = Math.ceil(sortedApplications.length / ITEMS_PER_PAGE);

    // Reset to first page when search term or group filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, groupFilter]);

    const handleSort = (field: "name" | "created_at") => {
        setIsLoading(true);
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
        // Simulate loading delay
        setTimeout(() => setIsLoading(false), 300);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Applications" />

            {/* Breadcrumb */}
            <Breadcrumb items={[{ label: "Applications" }]} />

            {/* Hero Header */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="relative z-10 px-6 py-8 sm:px-8 md:flex md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Applications
                        </h1>
                        <p className="mt-2 max-w-2xl text-blue-100">
                            Manage your applications, their environment
                            variables, and access keys in one place.
                        </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-3">
                        {canCreateApplication && (
                            <Link href={route("applications.create")}>
                                <Button className="shadow-md bg-white text-blue-600 hover:bg-gray-100 gap-1.5 font-medium">
                                    <Plus className="h-4 w-4" />
                                    <span>Create Application</span>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search applications..."
                        className="pl-9 pr-4 py-2 border-gray-200 focus-visible:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    {isSuperAdmin && (
                        <Select
                            value={groupFilter.toString()}
                            onValueChange={(value) =>
                                setGroupFilter(
                                    value === "all" ? "all" : parseInt(value)
                                )
                            }
                        >
                            <SelectTrigger className="w-[180px]">
                                <div className="flex items-center gap-2">
                                    <FolderTree className="h-4 w-4 text-gray-500" />
                                    <SelectValue placeholder="Filter by group" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Groups</SelectItem>
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
                    )}
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
                                Sort applications by
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleSort("name")}
                            >
                                <span
                                    className={
                                        sortField === "name" &&
                                        sortDirection === "asc"
                                            ? "font-medium text-blue-600"
                                            : ""
                                    }
                                >
                                    Name (A-Z)
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => {
                                    setSortField("name");
                                    setSortDirection("desc");
                                }}
                            >
                                <span
                                    className={
                                        sortField === "name" &&
                                        sortDirection === "desc"
                                            ? "font-medium text-blue-600"
                                            : ""
                                    }
                                >
                                    Name (Z-A)
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => {
                                    setSortField("created_at");
                                    setSortDirection("desc");
                                }}
                            >
                                <span
                                    className={
                                        sortField === "created_at" &&
                                        sortDirection === "desc"
                                            ? "font-medium text-blue-600"
                                            : ""
                                    }
                                >
                                    Date Created (Newest)
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => {
                                    setSortField("created_at");
                                    setSortDirection("asc");
                                }}
                            >
                                <span
                                    className={
                                        sortField === "created_at" &&
                                        sortDirection === "asc"
                                            ? "font-medium text-blue-600"
                                            : ""
                                    }
                                >
                                    Date Created (Oldest)
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm mb-4">
                <div className="text-gray-500">
                    {isLoading ? (
                        <Skeleton className="h-5 w-40" />
                    ) : (
                        <>
                            {filteredApplications.length}{" "}
                            {filteredApplications.length === 1
                                ? "application"
                                : "applications"}{" "}
                            found
                        </>
                    )}
                </div>
            </div>

            {/* Applications Content */}
            {filteredApplications.length > 0 ? (
                <>
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                                        <th
                                            className="px-4 py-3 font-semibold cursor-pointer"
                                            onClick={() => handleSort("name")}
                                        >
                                            <div className="flex items-center">
                                                Name
                                                <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
                                            </div>
                                        </th>
                                        {isSuperAdmin && (
                                            <th className="px-4 py-3 font-semibold">
                                                Group
                                            </th>
                                        )}
                                        <th className="hidden px-4 py-3 font-semibold md:table-cell">
                                            Description
                                        </th>
                                        <th className="hidden px-4 py-3 font-semibold md:table-cell">
                                            Health
                                        </th>
                                        <th className="hidden px-4 py-3 font-semibold md:table-cell">
                                            Variables
                                        </th>
                                        <th className="hidden px-4 py-3 font-semibold md:table-cell">
                                            Keys
                                        </th>
                                        <th className="px-4 py-3 text-right font-semibold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {isLoading
                                        ? Array.from({ length: 5 }).map(
                                              (_, i) => (
                                                  <tr key={`skeleton-${i}`}>
                                                      <td className="px-4 py-3">
                                                          <div className="flex items-center gap-3">
                                                              <Skeleton className="h-8 w-8 rounded-md" />
                                                              <Skeleton className="h-5 w-32" />
                                                          </div>
                                                      </td>
                                                      <td className="px-4 py-3">
                                                          <Skeleton className="h-5 w-24" />
                                                      </td>
                                                      <td className="hidden px-4 py-3 md:table-cell">
                                                          <Skeleton className="h-5 w-48" />
                                                      </td>
                                                      <td className="hidden px-4 py-3 md:table-cell">
                                                          <Skeleton className="h-5 w-32" />
                                                      </td>
                                                      <td className="hidden px-4 py-3 md:table-cell">
                                                          <Skeleton className="h-5 w-16" />
                                                      </td>
                                                      <td className="hidden px-4 py-3 md:table-cell">
                                                          <Skeleton className="h-5 w-16" />
                                                      </td>
                                                      <td className="px-4 py-3 text-right">
                                                          <Skeleton className="h-8 w-8 rounded-md inline-block" />
                                                      </td>
                                                  </tr>
                                              )
                                          )
                                        : paginatedApplications.map(
                                              (application) => (
                                                  <tr
                                                      key={application.id}
                                                      className="hover:bg-gray-50/50"
                                                  >
                                                      <td className="whitespace-nowrap px-4 py-3">
                                                          <div className="flex items-center gap-3">
                                                              <div>
                                                                  <Link
                                                                      href={route(
                                                                          "applications.show",
                                                                          application.id
                                                                      )}
                                                                      className="font-medium text-gray-900 hover:text-blue-600"
                                                                  >
                                                                      {
                                                                          application.name
                                                                      }
                                                                  </Link>
                                                              </div>
                                                          </div>
                                                      </td>
                                                      {isSuperAdmin && (
                                                          <td className="px-4 py-3">
                                                              {application.group ? (
                                                                  <Link
                                                                      href={route(
                                                                          "groups.show",
                                                                          application
                                                                              .group
                                                                              .id
                                                                      )}
                                                                      className="inline-flex items-center gap-1"
                                                                  >
                                                                      <Badge
                                                                          variant="outline"
                                                                          className="hover:bg-gray-100"
                                                                      >
                                                                          <FolderTree className="mr-1 h-3 w-3 text-gray-500" />
                                                                          {
                                                                              application
                                                                                  .group
                                                                                  .name
                                                                          }
                                                                      </Badge>
                                                                  </Link>
                                                              ) : (
                                                                  <span className="text-gray-400 italic text-xs">
                                                                      No group
                                                                  </span>
                                                              )}
                                                          </td>
                                                      )}
                                                      <td className="hidden px-4 py-3 text-gray-600 md:table-cell">
                                                          {application.description ? (
                                                              <span className="line-clamp-1">
                                                                  {
                                                                      application.description
                                                                  }
                                                              </span>
                                                          ) : (
                                                              <span className="text-gray-400 italic">
                                                                  No description
                                                              </span>
                                                          )}
                                                      </td>
                                                      <td className="hidden px-4 py-3 md:table-cell">
                                                          <div className="flex flex-col">
                                                              <div className="flex items-center justify-between mb-1">
                                                                  <span className="text-xs font-medium text-gray-700">
                                                                      {application.health ===
                                                                      100 ? (
                                                                          <span className="text-green-600">
                                                                              Safe
                                                                              to
                                                                              delete
                                                                          </span>
                                                                      ) : (
                                                                          `${application.health}% filled`
                                                                      )}
                                                                  </span>
                                                              </div>
                                                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                  <div
                                                                      className={`h-1.5 rounded-full ${
                                                                          application.health ===
                                                                          100
                                                                              ? "bg-green-500"
                                                                              : application.health >=
                                                                                70
                                                                              ? "bg-blue-500"
                                                                              : application.health >=
                                                                                40
                                                                              ? "bg-yellow-500"
                                                                              : "bg-red-500"
                                                                      }`}
                                                                      style={{
                                                                          width: `${application.health}%`,
                                                                      }}
                                                                  ></div>
                                                              </div>
                                                          </div>
                                                      </td>
                                                      <td className="hidden px-4 py-3 md:table-cell">
                                                          <Badge
                                                              variant="secondary"
                                                              className="bg-blue-50 text-blue-800 hover:bg-blue-100"
                                                          >
                                                              {application
                                                                  .env_variables
                                                                  ?.length || 0}
                                                          </Badge>
                                                      </td>
                                                      <td className="hidden px-4 py-3 md:table-cell">
                                                          <Badge
                                                              variant="secondary"
                                                              className="bg-purple-50 text-purple-800 hover:bg-purple-100"
                                                          >
                                                              {application
                                                                  .access_keys
                                                                  ?.length || 0}
                                                          </Badge>
                                                      </td>
                                                      <td className="whitespace-nowrap px-4 py-3 text-right">
                                                          <div className="flex items-center justify-end gap-2">
                                                              {application.userCanView && (
                                                                  <TooltipProvider>
                                                                      <Tooltip>
                                                                          <TooltipTrigger
                                                                              asChild
                                                                          >
                                                                              <Button
                                                                                  variant="ghost"
                                                                                  size="sm"
                                                                                  className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                                                                                  onClick={() =>
                                                                                      router.visit(
                                                                                          route(
                                                                                              "applications.show",
                                                                                              application.id
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
                                                                                  application
                                                                                  details
                                                                              </p>
                                                                          </TooltipContent>
                                                                      </Tooltip>
                                                                  </TooltipProvider>
                                                              )}

                                                              {application.userCanEdit && (
                                                                  <TooltipProvider>
                                                                      <Tooltip>
                                                                          <TooltipTrigger
                                                                              asChild
                                                                          >
                                                                              <Button
                                                                                  variant="ghost"
                                                                                  size="sm"
                                                                                  className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                                                                                  onClick={() =>
                                                                                      router.visit(
                                                                                          route(
                                                                                              "applications.edit",
                                                                                              application.id
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
                                                                                  application
                                                                              </p>
                                                                          </TooltipContent>
                                                                      </Tooltip>
                                                                  </TooltipProvider>
                                                              )}

                                                              {application.userCanDelete && (
                                                                  <TooltipProvider>
                                                                      <Tooltip>
                                                                          <TooltipTrigger
                                                                              asChild
                                                                          >
                                                                              <Button
                                                                                  variant="ghost"
                                                                                  size="sm"
                                                                                  className={`h-8 w-8 p-0 ${
                                                                                      parseFloat(
                                                                                          application.health.toString()
                                                                                      ) ===
                                                                                      0
                                                                                          ? "text-gray-500 hover:text-red-600"
                                                                                          : "text-gray-300 cursor-not-allowed"
                                                                                  }`}
                                                                                  onClick={() =>
                                                                                      parseFloat(
                                                                                          application.health.toString()
                                                                                      ) ===
                                                                                          0 &&
                                                                                      handleDeleteRequest(
                                                                                          application.id,
                                                                                          application.name
                                                                                      )
                                                                                  }
                                                                                  disabled={
                                                                                      parseFloat(
                                                                                          application.health.toString()
                                                                                      ) !==
                                                                                      0.0
                                                                                  }
                                                                              >
                                                                                  <Trash className="h-4 w-4" />
                                                                                  <span className="sr-only">
                                                                                      Delete
                                                                                  </span>
                                                                              </Button>
                                                                          </TooltipTrigger>
                                                                          <TooltipContent>
                                                                              {application.health >
                                                                              0
                                                                                  ? "Cannot delete - contains filled values"
                                                                                  : "Delete application"}
                                                                          </TooltipContent>
                                                                      </Tooltip>
                                                                  </TooltipProvider>
                                                              )}
                                                          </div>
                                                      </td>
                                                  </tr>
                                              )
                                          )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Use the imported ClientPagination component */}
                    <ClientPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={sortedApplications.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        setCurrentPage={setCurrentPage}
                    />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                        <Code className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="mb-1 text-lg font-medium">
                        No applications found
                    </h3>
                    <p className="mb-6 max-w-md text-gray-500">
                        {searchTerm || groupFilter !== "all"
                            ? "Try adjusting your search terms or filters"
                            : "Create your first application to start managing environment variables"}
                    </p>
                    {canCreateApplication &&
                        !searchTerm &&
                        groupFilter === "all" && (
                            <Link href={route("applications.create")}>
                                <Button className="shadow-sm bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                                    <Plus className="h-4 w-4" /> Create Your
                                    First Application
                                </Button>
                            </Link>
                        )}
                </div>
            )}
            <Dialog
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">
                            <div className="flex items-center">
                                <Trash className="mr-2 h-5 w-5" />
                                Confirm Deletion
                            </div>
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the application{" "}
                            <span className="font-semibold text-gray-700">
                                "{applicationToDelete?.name}"
                            </span>
                            ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <p className="text-sm text-gray-500">
                            All associated environment variables and access keys
                            will be permanently removed.
                        </p>
                    </div>
                    <DialogFooter className="flex space-x-2 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={cancelDelete}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={confirmDelete}
                        >
                            Delete Application
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
};

export default ApplicationsIndex;

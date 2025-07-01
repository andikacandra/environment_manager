"use client";

import { useEffect, useMemo, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import type { PageProps, Permission, Role, User } from "@/types";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
    ArrowLeft,
    Shield,
    Lock,
    UserCircle,
    CalendarDays,
    Settings,
    Search,
    CheckCircle2,
    AlertCircle,
    Eye,
    Plus,
    Pencil,
    Trash2,
    RefreshCw,
    Users,
    ScrollText,
    CheckSquare,
    Loader2,
    Save,
    Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface RolesShowProps extends PageProps {
    role: Role & {
        permissions: Permission[];
        users: User[];
    };
    permissions: Permission[];
    users: User[];

    canGivePermission: boolean;
    canRevokePermission: boolean;
    canAssignRole: boolean;
}

const RolesShow = () => {
    const {
        role,
        users,
        permissions,
        canGivePermission,
        canRevokePermission,
        canAssignRole,
    } = usePage<RolesShowProps>().props;

    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [permissionModalSearchTerm, setPermissionModalSearchTerm] =
        useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
        []
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    // State for search filters
    const [permissionSearchTerm, setPermissionSearchTerm] = useState("");
    const [userSearchTerm, setUserSearchTerm] = useState("");

    // Add these state variables after the existing state declarations
    const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
    const [userModalSearchTerm, setUserModalSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [isSubmittingUsers, setIsSubmittingUsers] = useState(false);

    useEffect(() => {
        if (role.permissions) {
            setSelectedPermissions(role.permissions.map((p) => p.id));
        }
    }, [role.permissions]);

    // Add this useEffect after the existing useEffect
    useEffect(() => {
        if (role.users) {
            setSelectedUsers(role.users.map((u) => u.id));
        }
    }, [role.users]);

    // Filter permissions and users based on search terms
    const filteredPermissions =
        role.permissions?.filter((permission) =>
            permission.name
                .toLowerCase()
                .includes(permissionSearchTerm.toLowerCase())
        ) || [];

    const filteredUsers =
        role.users?.filter(
            (user) =>
                user.full_name
                    .toLowerCase()
                    .includes(userSearchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
        ) || [];

    const filteredModalPermissions = useMemo(() => {
        return permissions.filter((permission) =>
            permission.name
                .toLowerCase()
                .includes(permissionModalSearchTerm.toLowerCase())
        );
    }, [permissions, permissionModalSearchTerm]);

    // Add this computed property after the filteredModalPermissions
    const filteredModalUsers = useMemo(() => {
        return (
            users.filter(
                (user) =>
                    user.full_name
                        .toLowerCase()
                        .includes(userModalSearchTerm.toLowerCase()) ||
                    user.email
                        .toLowerCase()
                        .includes(userModalSearchTerm.toLowerCase())
            ) || []
        );
    }, [role.users, userModalSearchTerm]);

    const groupedModalPermissions = useMemo(() => {
        const grouped: Record<string, Permission[]> = {};

        filteredModalPermissions.forEach((permission) => {
            // Extract category from permission name (e.g., "create-users" -> "users")
            const parts = permission.name.split("-");
            if (parts.length >= 2) {
                const category = parts[1];
                if (!grouped[category]) {
                    grouped[category] = [];
                }
                grouped[category].push(permission);
            } else {
                // For permissions that don't follow the pattern
                if (!grouped.other) {
                    grouped.other = [];
                }
                grouped.other.push(permission);
            }
        });

        return grouped;
    }, [filteredModalPermissions]);

    const togglePermission = (id: number) => {
        setSelectedPermissions((prev) =>
            prev.includes(id)
                ? prev.filter((permId) => permId !== id)
                : [...prev, id]
        );
    };

    // Add this function after the togglePermission function
    const toggleUser = (id: number) => {
        setSelectedUsers((prev) =>
            prev.includes(id)
                ? prev.filter((userId) => userId !== id)
                : [...prev, id]
        );
    };

    const handleSubmitPermissions = () => {
        setIsSubmitting(true);

        router.put(
            route("roles.permissions.update", role.id),
            {
                permissions: selectedPermissions,
            },
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                    setIsPermissionsModalOpen(false);
                    setPermissionModalSearchTerm("");
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    // Add this function after the handleSubmitPermissions function
    const handleSubmitUsers = () => {
        setIsSubmittingUsers(true);

        router.put(
            route("roles.users.update", role.id),
            {
                users: selectedUsers,
            },
            {
                onSuccess: () => {
                    setIsSubmittingUsers(false);
                    setIsUsersModalOpen(false);
                    setUserModalSearchTerm("");
                },
                onError: () => {
                    setIsSubmittingUsers(false);
                },
            }
        );
    };

    // Get role badge color based on name
    const getRoleColorClass = (roleName: string) => {
        const roleColors: { [key: string]: string } = {
            admin: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900",
            administrator:
                "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900",
            editor: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900",
            manager:
                "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900",
            user: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900",
            viewer: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
            guest: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900",
        };

        return (
            roleColors[roleName.toLowerCase()] ||
            "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-900"
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

    // Group permissions by category/module
    const groupedPermissions =
        role.permissions?.reduce((acc, permission) => {
            // Extract prefix from permission name (e.g., "create-users" -> "users")
            const parts = permission.name.split("-");
            if (parts.length >= 2) {
                const category = parts[1];
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(permission);
            } else {
                // For permissions that don't follow the pattern
                if (!acc.other) {
                    acc.other = [];
                }
                acc.other.push(permission);
            }
            return acc;
        }, {} as Record<string, Permission[]>) || {};

    // Color mapping for permission categories
    const getCategoryColorClass = (category: string) => {
        const categoryColors: { [key: string]: string } = {
            users: "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50",
            roles: "text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/50",
            permissions:
                "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50",
            settings:
                "text-gray-600 bg-gray-50 border-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
            posts: "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50",
            products:
                "text-cyan-600 bg-cyan-50 border-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-900/50",
        };

        return (
            categoryColors[category.toLowerCase()] ||
            "text-gray-600 bg-gray-50 border-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
        );
    };

    // Get permission action icon
    const getPermissionActionIcon = (permissionName: string) => {
        const actionIcons: { [key: string]: JSX.Element } = {
            create: <Plus className="h-3.5 w-3.5 text-emerald-500" />,
            view: <Eye className="h-3.5 w-3.5 text-blue-500" />,
            edit: <Pencil className="h-3.5 w-3.5 text-amber-500" />,
            delete: <Trash2 className="h-3.5 w-3.5 text-red-500" />,
            manage: <Settings className="h-3.5 w-3.5 text-purple-500" />,
            update: <RefreshCw className="h-3.5 w-3.5 text-green-500" />,
            list: <ScrollText className="h-3.5 w-3.5 text-indigo-500" />,
        };

        const action = permissionName.split("-")[0];
        return (
            actionIcons[action] || (
                <CheckCircle2 className="h-3.5 w-3.5 text-gray-500" />
            )
        );
    };

    // Get user initials for avatar
    const getUserInitials = (name: string) => {
        if (!name) return "U";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    // Get a color for user avatar based on name
    const getUserAvatarColor = (name: string) => {
        const colors = [
            "bg-blue-100 text-blue-700",
            "bg-green-100 text-green-700",
            "bg-amber-100 text-amber-700",
            "bg-purple-100 text-purple-700",
            "bg-pink-100 text-pink-700",
            "bg-red-100 text-red-700",
            "bg-indigo-100 text-indigo-700",
            "bg-cyan-100 text-cyan-700",
        ];

        // Simple hash function to get consistent color for the same name
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    };

    // Check if we can show the admin actions
    const canManageRole = true; // Replace with actual permission check

    return (
        <AuthenticatedLayout>
            <Head title={`Role: ${role.name}`} />
            {/* Hero section with gradient background */}
            <Breadcrumb
                items={[
                    {
                        label: "Roles",
                        href: route("roles.index"),
                    },
                    { label: role.name },
                ]}
            />
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 -mx-6 px-6 py-8 mb-6">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumb */}

                    {/* Page Header */}
                    <div className="mt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 shadow-sm border border-indigo-100 dark:border-gray-700">
                                        <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold tracking-tight">
                                            {role.name}
                                        </h1>
                                        <p className="text-muted-foreground mt-1">
                                            Role details and management
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <TooltipProvider>
                                    <Link href={route("roles.index")}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 gap-1 shadow-sm"
                                        >
                                            <ArrowLeft className="h-4 w-4" />{" "}
                                            Back to Roles
                                        </Button>
                                    </Link>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex items-center">
                                <div className="p-4 flex-1">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Guard Name
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 font-medium"
                                        >
                                            {role.guard_name}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 h-full p-4 flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex items-center">
                                <div className="p-4 flex-1">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Total Permissions
                                    </p>
                                    <div className="mt-1">
                                        <p className="text-2xl font-bold">
                                            {role.permissions?.length || 0}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 h-full p-4 flex items-center justify-center">
                                    <Lock className="h-5 w-5 text-green-500 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex items-center">
                                <div className="p-4 flex-1">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Assigned Users
                                    </p>
                                    <div className="mt-1">
                                        <p className="text-2xl font-bold">
                                            {role.users?.length || 0}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 h-full p-4 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Role Summary */}
                    <Card className="md:col-span-1 shadow-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <CardHeader className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />{" "}
                                Role Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 py-5 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Role Name
                                    </h3>
                                    <div className="mt-1 flex items-center">
                                        <Badge
                                            className={cn(
                                                "px-2.5 py-1 font-medium text-sm",
                                                getRoleColorClass(role.name)
                                            )}
                                        >
                                            {role.name}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator className="dark:border-gray-700" />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Created
                                        </h3>
                                        <div className="mt-1 flex items-center gap-1.5">
                                            <CalendarDays className="h-4 w-4 text-gray-400" />
                                            <p className="text-sm">
                                                {formatDate(role.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Last Updated
                                        </h3>
                                        <div className="mt-1 flex items-center gap-1.5">
                                            <RefreshCw className="h-4 w-4 text-gray-400" />
                                            <p className="text-sm">
                                                {formatDate(role.updated_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="dark:border-gray-700" />

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                                        Permissions by Category
                                    </h3>
                                    <div className="space-y-3">
                                        {Object.entries(groupedPermissions).map(
                                            ([category, permissions]) => (
                                                <div
                                                    key={category}
                                                    className="flex items-center justify-between py-1.5 px-3 bg-gray-50 dark:bg-gray-800/80 rounded-md border border-gray-100 dark:border-gray-700"
                                                >
                                                    <span className="text-sm font-medium">
                                                        {category}
                                                    </span>
                                                    <Badge
                                                        className={cn(
                                                            "text-xs",
                                                            getCategoryColorClass(
                                                                category
                                                            )
                                                        )}
                                                    >
                                                        {permissions.length}
                                                    </Badge>
                                                </div>
                                            )
                                        )}
                                        {Object.keys(groupedPermissions)
                                            .length === 0 && (
                                            <div className="text-center py-3 text-sm text-gray-500">
                                                No permissions assigned
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs for permissions and users */}
                    <div className="md:col-span-2 space-y-6">
                        <Tabs defaultValue="permissions" className="w-full">
                            <TabsList className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-0.5 mb-1">
                                <TabsTrigger
                                    value="permissions"
                                    className="data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800 data-[state=active]:border-gray-200 data-[state=active]:dark:border-gray-700 data-[state=active]:shadow-sm flex-1"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Lock className="h-4 w-4" />
                                        Permissions
                                        <Badge
                                            variant="outline"
                                            className="ml-1 bg-gray-100 dark:bg-gray-800"
                                        >
                                            {role.permissions?.length || 0}
                                        </Badge>
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="users"
                                    className="data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800 data-[state=active]:border-gray-200 data-[state=active]:dark:border-gray-700 data-[state=active]:shadow-sm flex-1"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <UserCircle className="h-4 w-4" />
                                        Users
                                        <Badge
                                            variant="outline"
                                            className="ml-1 bg-gray-100 dark:bg-gray-800"
                                        >
                                            {role.users?.length || 0}
                                        </Badge>
                                    </div>
                                </TabsTrigger>
                            </TabsList>

                            {/* Permissions Tab */}
                            <TabsContent value="permissions" className="mt-4">
                                <Card className="shadow-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                    <CardHeader className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Lock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            Permission List
                                        </CardTitle>

                                        <div className="flex gap-2">
                                            {canGivePermission && (
                                                <Button
                                                    variant="outline"
                                                    className="gap-1"
                                                    onClick={() =>
                                                        setIsPermissionsModalOpen(
                                                            true
                                                        )
                                                    }
                                                    size="sm"
                                                >
                                                    <Settings className="h-4 w-4" />{" "}
                                                    Manage
                                                </Button>
                                            )}

                                            <div className="relative">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                                <Input
                                                    type="search"
                                                    placeholder="Filter permissions..."
                                                    value={permissionSearchTerm}
                                                    onChange={(e) =>
                                                        setPermissionSearchTerm(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="pl-9 w-[220px]"
                                                />
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-0">
                                        {Object.entries(groupedPermissions)
                                            .length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                    <Lock className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                                                </div>
                                                <h3 className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    No permissions assigned
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                                                    This role doesn't have any
                                                    permissions yet
                                                </p>
                                                {canGivePermission && (
                                                    <Button
                                                        variant="outline"
                                                        className="gap-1"
                                                        onClick={() =>
                                                            setIsPermissionsModalOpen(
                                                                true
                                                            )
                                                        }
                                                        size="sm"
                                                    >
                                                        <Settings className="h-4 w-4" />{" "}
                                                        Manage
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {permissionSearchTerm ? (
                                                    <div className="p-6">
                                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                                                            Search Results (
                                                            {
                                                                filteredPermissions.length
                                                            }
                                                            )
                                                        </h3>
                                                        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                                                            {filteredPermissions.map(
                                                                (
                                                                    permission
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            permission.id
                                                                        }
                                                                        className="flex items-center gap-2 p-2.5 rounded-md border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                                                    >
                                                                        {getPermissionActionIcon(
                                                                            permission.name
                                                                        )}
                                                                        <span className="text-sm">
                                                                            {
                                                                                permission.name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                        {filteredPermissions.length ===
                                                            0 && (
                                                            <div className="flex flex-col items-center justify-center py-6 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                                                <AlertCircle className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                                                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                                    No
                                                                    permissions
                                                                    found
                                                                    matching "
                                                                    {
                                                                        permissionSearchTerm
                                                                    }
                                                                    "
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    Object.entries(
                                                        groupedPermissions
                                                    ).map(
                                                        ([
                                                            category,
                                                            permissions,
                                                        ]) => (
                                                            <div
                                                                key={category}
                                                                className="p-6"
                                                            >
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase flex items-center gap-2">
                                                                        <Badge
                                                                            className={cn(
                                                                                "px-2 py-0.5 text-xs",
                                                                                getCategoryColorClass(
                                                                                    category
                                                                                )
                                                                            )}
                                                                        >
                                                                            {
                                                                                category
                                                                            }
                                                                        </Badge>
                                                                        <span>
                                                                            (
                                                                            {
                                                                                permissions.length
                                                                            }
                                                                            )
                                                                        </span>
                                                                    </h3>
                                                                </div>
                                                                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                                                                    {permissions.map(
                                                                        (
                                                                            permission
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    permission.id
                                                                                }
                                                                                className="flex items-center gap-2 p-2.5 rounded-md border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                                                            >
                                                                                {getPermissionActionIcon(
                                                                                    permission.name
                                                                                )}
                                                                                <span className="text-sm">
                                                                                    {
                                                                                        permission.name
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Users Tab */}
                            <TabsContent value="users" className="mt-4">
                                <Card className="shadow-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                    <CardHeader className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <UserCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            Users with {role.name} Role
                                        </CardTitle>

                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                <Input
                                                    type="search"
                                                    placeholder="Search users..."
                                                    value={userSearchTerm}
                                                    onChange={(e) =>
                                                        setUserSearchTerm(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="pl-9 w-[220px] border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                                />
                                            </div>
                                            {canAssignRole && (
                                                <Button
                                                    size="sm"
                                                    className="gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                                                    onClick={() =>
                                                        setIsUsersModalOpen(
                                                            true
                                                        )
                                                    }
                                                >
                                                    <Plus className="h-4 w-4" />{" "}
                                                    Add User
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>

                                    {filteredUsers.length === 0 ? (
                                        <CardContent>
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                    <Users className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                                                </div>
                                                <h3 className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    No users found
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 text-center max-w-md">
                                                    {userSearchTerm
                                                        ? `No users match "${userSearchTerm}"`
                                                        : "This role hasn't been assigned to any users yet"}
                                                </p>
                                                {canAssignRole &&
                                                    !userSearchTerm && (
                                                        <Button
                                                            size="sm"
                                                            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
                                                            onClick={() =>
                                                                setIsUsersModalOpen(
                                                                    true
                                                                )
                                                            }
                                                        >
                                                            <Plus className="h-4 w-4 mr-1" />
                                                            Assign to Users
                                                        </Button>
                                                    )}
                                            </div>
                                        </CardContent>
                                    ) : (
                                        <div className="overflow-hidden">
                                            <Table>
                                                <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                                                    <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                        <TableHead className="font-medium">
                                                            User
                                                        </TableHead>
                                                        <TableHead className="font-medium">
                                                            Email
                                                        </TableHead>
                                                        <TableHead className="font-medium">
                                                            Created
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredUsers.map(
                                                        (user) => (
                                                            <TableRow
                                                                key={user.id}
                                                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                            >
                                                                <TableCell className="font-medium">
                                                                    <div className="flex items-center gap-3">
                                                                        <div
                                                                            className={cn(
                                                                                "rounded-full w-8 h-8 flex items-center justify-center font-medium text-sm",
                                                                                getUserAvatarColor(
                                                                                    user.full_name
                                                                                )
                                                                            )}
                                                                        >
                                                                            {getUserInitials(
                                                                                user.full_name
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-medium">
                                                                                {
                                                                                    user.full_name
                                                                                }
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                                ID:{" "}
                                                                                {
                                                                                    user.id
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-gray-600 dark:text-gray-300">
                                                                            {
                                                                                user.email
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-gray-500 dark:text-gray-400 text-sm">
                                                                    {formatDate(
                                                                        user.created_at
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
            <Dialog
                open={isPermissionsModalOpen}
                onOpenChange={setIsPermissionsModalOpen}
            >
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-indigo-600" />
                            Manage Permissions for {role.name}
                        </DialogTitle>
                        <DialogDescription>
                            Select the permissions you want to assign to this
                            role. Users with this role will inherit these
                            permissions.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative mt-3">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            type="search"
                            placeholder="Search permissions..."
                            value={permissionModalSearchTerm}
                            onChange={(e) =>
                                setPermissionModalSearchTerm(e.target.value)
                            }
                            className="pl-9 bg-white"
                        />
                    </div>

                    <div className="overflow-y-auto flex-1 mt-3">
                        {Object.keys(groupedModalPermissions).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <AlertCircle className="h-10 w-10 text-gray-300" />
                                <h3 className="mt-3 text-sm font-medium text-gray-500">
                                    No permissions found
                                </h3>
                                <p className="mt-1 text-sm text-gray-400">
                                    {permissionModalSearchTerm
                                        ? `No permissions match "${permissionModalSearchTerm}"`
                                        : "No permissions are available to assign"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(groupedModalPermissions).map(
                                    ([category, permissions]) => (
                                        <div
                                            key={category}
                                            className="bg-gray-50 rounded-md p-4"
                                        >
                                            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                                                {category} ({permissions.length}
                                                )
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {permissions.map(
                                                    (permission) => (
                                                        <div
                                                            key={permission.id}
                                                            className={cn(
                                                                "flex items-start gap-2 p-3 rounded-md border cursor-pointer",
                                                                selectedPermissions.includes(
                                                                    permission.id
                                                                )
                                                                    ? "bg-indigo-50 border-indigo-200"
                                                                    : "bg-white border-gray-200"
                                                            )}
                                                            onClick={() =>
                                                                togglePermission(
                                                                    permission.id
                                                                )
                                                            }
                                                        >
                                                            <div className="flex-shrink-0 mt-0.5">
                                                                {selectedPermissions.includes(
                                                                    permission.id
                                                                ) ? (
                                                                    <CheckSquare className="h-5 w-5 text-indigo-600" />
                                                                ) : (
                                                                    <Square className="h-5 w-5 text-gray-400" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-sm">
                                                                    {
                                                                        permission.name
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-0.5">
                                                                    Guard:{" "}
                                                                    {
                                                                        permission.guard_name
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-3 border-t mt-4">
                        <div className="flex justify-between items-center w-full">
                            <div className="text-sm">
                                <span className="font-medium">
                                    {selectedPermissions.length}
                                </span>{" "}
                                permissions selected
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        // Reset to original role permissions
                                        if (role.permissions) {
                                            setSelectedPermissions(
                                                role.permissions.map(
                                                    (p) => p.id
                                                )
                                            );
                                        }
                                        setIsPermissionsModalOpen(false);
                                        setPermissionModalSearchTerm("");
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmitPermissions}
                                    disabled={isSubmitting}
                                    className="gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save Permissions
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            // Add this modal at the end of the component, right after the
            permissions modal
            <Dialog open={isUsersModalOpen} onOpenChange={setIsUsersModalOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-indigo-600" />
                            Assign Users to {role.name} Role
                        </DialogTitle>
                        <DialogDescription>
                            Select the users you want to assign to this role.
                            They will inherit all permissions granted to this
                            role.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative mt-3">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            type="search"
                            placeholder="Search users..."
                            value={userModalSearchTerm}
                            onChange={(e) =>
                                setUserModalSearchTerm(e.target.value)
                            }
                            className="pl-9 bg-white"
                        />
                    </div>

                    <div className="overflow-y-auto flex-1 mt-3">
                        {filteredModalUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <AlertCircle className="h-10 w-10 text-gray-300" />
                                <h3 className="mt-3 text-sm font-medium text-gray-500">
                                    No users found
                                </h3>
                                <p className="mt-1 text-sm text-gray-400">
                                    {userModalSearchTerm
                                        ? `No users match "${userModalSearchTerm}"`
                                        : "No users are available to assign"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 p-1">
                                {filteredModalUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className={cn(
                                            "flex items-start gap-3 p-3 rounded-md border cursor-pointer",
                                            selectedUsers.includes(user.id)
                                                ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800"
                                                : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                                        )}
                                        onClick={() => toggleUser(user.id)}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {selectedUsers.includes(user.id) ? (
                                                <CheckSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            ) : (
                                                <Square className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 flex-1">
                                            <div
                                                className={cn(
                                                    "rounded-full w-8 h-8 flex items-center justify-center font-medium text-sm",
                                                    getUserAvatarColor(
                                                        user.full_name
                                                    )
                                                )}
                                            >
                                                {getUserInitials(
                                                    user.full_name
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">
                                                    {user.full_name}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-3 border-t mt-4">
                        <div className="flex justify-between items-center w-full">
                            <div className="text-sm">
                                <span className="font-medium">
                                    {selectedUsers.length}
                                </span>{" "}
                                users selected
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        // Reset to original role users
                                        if (role.users) {
                                            setSelectedUsers(
                                                role.users.map((u) => u.id)
                                            );
                                        }
                                        setIsUsersModalOpen(false);
                                        setUserModalSearchTerm("");
                                    }}
                                    disabled={isSubmittingUsers}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmitUsers}
                                    disabled={isSubmittingUsers}
                                    className="gap-2"
                                >
                                    {isSubmittingUsers ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save Users
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
};

export default RolesShow;

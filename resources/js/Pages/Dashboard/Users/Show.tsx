import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import type { PageProps, Permission, Role, User } from "@/types";
import {
    ArrowLeft,
    Building,
    Calendar,
    CheckCircle2,
    Clock,
    Key,
    Lock,
    Mail,
    Shield,
    Tag,
    UserIcon,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UsersShowProps extends PageProps {
    user: User;
    permissions_by_category: Record<string, Permission[]>;
    roles: Role[];
    direct_permissions: Permission[];
    role_permissions: Permission[];
}

const UsersShow = () => {
    const {
        user,
        roles,
        permissions_by_category,
        role_permissions,
        direct_permissions,
    } = usePage<UsersShowProps>().props;

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Format time for display
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Get a badge color class based on role name
    const getRoleBadgeColor = (roleName: string) => {
        const roleColors: Record<string, string> = {
            admin: "bg-red-100 text-red-800 border-red-200",
            administrator: "bg-red-100 text-red-800 border-red-200",
            manager: "bg-purple-100 text-purple-800 border-purple-200",
            editor: "bg-blue-100 text-blue-800 border-blue-200",
            user: "bg-green-100 text-green-800 border-green-200",
            viewer: "bg-gray-100 text-gray-800 border-gray-200",
            guest: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };

        return (
            roleColors[roleName.toLowerCase()] ||
            "bg-indigo-100 text-indigo-800 border-indigo-200"
        );
    };

    // Get group role badge color
    const getGroupRoleBadgeColor = (role: string) => {
        const roleColors: Record<string, string> = {
            admin: "bg-red-100 text-red-800 border-red-200",
            owner: "bg-purple-100 text-purple-800 border-purple-200",
            manager: "bg-blue-100 text-blue-800 border-blue-200",
            member: "bg-green-100 text-green-800 border-green-200",
            guest: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };

        return (
            roleColors[role.toLowerCase()] ||
            "bg-gray-100 text-gray-800 border-gray-200"
        );
    };

    // Get a badge color based on permission category
    const getPermissionCategoryColor = (category: string) => {
        const categoryColors: Record<string, string> = {
            users: "bg-blue-100 text-blue-800 border-blue-200",
            roles: "bg-purple-100 text-purple-800 border-purple-200",
            permissions: "bg-indigo-100 text-indigo-800 border-indigo-200",
            applications: "bg-green-100 text-green-800 border-green-200",
            groups: "bg-amber-100 text-amber-800 border-amber-200",
            envs: "bg-cyan-100 text-cyan-800 border-cyan-200",
            variables: "bg-teal-100 text-teal-800 border-teal-200",
            keys: "bg-rose-100 text-rose-800 border-rose-200",
        };

        return (
            categoryColors[category.toLowerCase()] ||
            "bg-gray-100 text-gray-800 border-gray-200"
        );
    };

    // Get permission category from name
    const getPermissionCategory = (permissionName: string): string => {
        const parts = permissionName.split("-");
        if (parts.length >= 2) {
            return parts[1]; // Extract category part
        }
        return "other";
    };

    // Get permission action from name
    const getPermissionAction = (permissionName: string): string => {
        const parts = permissionName.split("-");
        if (parts.length >= 1) {
            return parts[0]; // Extract action part
        }
        return permissionName;
    };

    // Get action badge color
    const getActionBadgeColor = (action: string) => {
        const actionColors: Record<string, string> = {
            view: "bg-blue-100 text-blue-800 border-blue-200",
            create: "bg-green-100 text-green-800 border-green-200",
            edit: "bg-amber-100 text-amber-800 border-amber-200",
            update: "bg-amber-100 text-amber-800 border-amber-200",
            delete: "bg-red-100 text-red-800 border-red-200",
            manage: "bg-purple-100 text-purple-800 border-purple-200",
            list: "bg-indigo-100 text-indigo-800 border-indigo-200",
            assign: "bg-cyan-100 text-cyan-800 border-cyan-200",
            revoke: "bg-rose-100 text-rose-800 border-rose-200",
        };

        return (
            actionColors[action.toLowerCase()] ||
            "bg-gray-100 text-gray-800 border-gray-200"
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`User: ${user.full_name}`} />

            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: "Users", href: route("users.index") },
                    { label: user.full_name },
                ]}
            />

            {/* Page Header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">
                                User Profile
                            </h1>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            View user details, groups, roles and permissions.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route("users.index")}>
                            <Button variant="outline" className="gap-1">
                                <ArrowLeft className="h-4 w-4" /> Back to Users
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Profile Card */}
                <Card className="md:col-span-1">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5 text-indigo-600" />
                            User Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center mb-6">
                            <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                                <span className="text-3xl font-semibold text-indigo-700">
                                    {user.full_name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold">
                                {user.full_name}
                            </h2>
                            <div className="flex items-center mt-1 text-gray-500">
                                <Mail className="h-4 w-4 mr-1" />
                                <span>{user.email}</span>
                            </div>

                            <div className="flex flex-wrap gap-1 mt-3">
                                {roles.map((role) => (
                                    <Badge
                                        key={role.id}
                                        variant="outline"
                                        className={getRoleBadgeColor(role.name)}
                                    >
                                        {role.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center mb-1">
                                    <Shield className="h-4 w-4 text-indigo-600 mr-2" />
                                    <span className="text-sm font-medium">
                                        Roles
                                    </span>
                                </div>
                                <p className="text-sm pl-6">
                                    {roles.length > 0
                                        ? roles.map((r) => r.name).join(", ")
                                        : "No roles assigned"}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center mb-1">
                                    <Building className="h-4 w-4 text-indigo-600 mr-2" />
                                    <span className="text-sm font-medium">
                                        Groups
                                    </span>
                                </div>
                                <p className="text-sm pl-6">
                                    {user.group_members.length > 0
                                        ? user.group_members
                                              .map((g) => g.group.name)
                                              .join(", ")
                                        : "Not a member of any group"}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center mb-1">
                                    <Key className="h-4 w-4 text-indigo-600 mr-2" />
                                    <span className="text-sm font-medium">
                                        Permissions
                                    </span>
                                </div>
                                <p className="text-sm pl-6">
                                    {
                                        Object.keys(permissions_by_category)
                                            .length
                                    }{" "}
                                    categories,{" "}
                                    {
                                        Object.values(
                                            permissions_by_category
                                        ).flat().length
                                    }{" "}
                                    total permissions
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center mb-1">
                                    <Calendar className="h-4 w-4 text-indigo-600 mr-2" />
                                    <span className="text-sm font-medium">
                                        Created at
                                    </span>
                                </div>
                                <p className="text-sm pl-6">
                                    {formatDate(user.created_at)} at{" "}
                                    {formatTime(user.created_at)}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center mb-1">
                                    <Clock className="h-4 w-4 text-indigo-600 mr-2" />
                                    <span className="text-sm font-medium">
                                        Last updated
                                    </span>
                                </div>
                                <p className="text-sm pl-6">
                                    {formatDate(user.updated_at)} at{" "}
                                    {formatTime(user.updated_at)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs for Groups, Roles, and Permissions */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="groups">
                        <TabsList className="grid grid-cols-3">
                            <TabsTrigger
                                value="groups"
                                className="flex items-center gap-1.5"
                            >
                                <Users className="h-4 w-4" />
                                <span>Groups</span>
                                <Badge variant="secondary" className="ml-1">
                                    {user.group_members.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger
                                value="roles"
                                className="flex items-center gap-1.5"
                            >
                                <Shield className="h-4 w-4" />
                                <span>Roles</span>
                                <Badge variant="secondary" className="ml-1">
                                    {roles.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger
                                value="permissions"
                                className="flex items-center gap-1.5"
                            >
                                <Lock className="h-4 w-4" />
                                <span>Permissions</span>
                                <Badge variant="secondary" className="ml-1">
                                    {
                                        Object.values(
                                            permissions_by_category
                                        ).flat().length
                                    }
                                </Badge>
                            </TabsTrigger>
                        </TabsList>

                        {/* Groups Tab */}
                        <TabsContent value="groups">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">
                                        Group Memberships
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {user.group_members.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Users className="mx-auto h-10 w-10 text-gray-300" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                                No Group Memberships
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                This user is not a member of any
                                                groups.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {user.group_members.map(
                                                (groupMember) => (
                                                    <Card
                                                        key={groupMember.id}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="flex items-center p-4 border-b">
                                                            <div className="flex-1">
                                                                <Link
                                                                    href={route(
                                                                        "groups.show",
                                                                        groupMember
                                                                            .group
                                                                            .id
                                                                    )}
                                                                    className="font-medium hover:text-indigo-600"
                                                                >
                                                                    {
                                                                        groupMember
                                                                            .group
                                                                            .name
                                                                    }
                                                                </Link>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`ml-2 ${getGroupRoleBadgeColor(
                                                                        groupMember.role
                                                                    )}`}
                                                                >
                                                                    {
                                                                        groupMember.role
                                                                    }
                                                                </Badge>
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Joined{" "}
                                                                {formatDate(
                                                                    groupMember.created_at
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="p-4">
                                                            <p className="text-sm text-gray-600">
                                                                {
                                                                    groupMember
                                                                        .group
                                                                        .description
                                                                }
                                                            </p>
                                                        </div>
                                                    </Card>
                                                )
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Roles Tab */}
                        <TabsContent value="roles">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">
                                        Assigned Roles
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {user.roles.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Shield className="mx-auto h-10 w-10 text-gray-300" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                                No Roles Assigned
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                This user doesn't have any
                                                assigned roles.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {roles.map((role) => (
                                                <Card
                                                    key={role.id}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="flex items-center justify-between p-4 border-b">
                                                        <div className="flex items-center">
                                                            <div className="rounded-md bg-indigo-50 p-2 mr-3 text-indigo-700">
                                                                <Shield className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <Link
                                                                    href={route(
                                                                        "roles.show",
                                                                        role.id
                                                                    )}
                                                                    className="font-medium hover:text-indigo-600"
                                                                >
                                                                    {role.name}
                                                                </Link>
                                                                <p className="text-xs text-gray-500">
                                                                    Guard:{" "}
                                                                    {
                                                                        role.guard_name
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Permissions Tab */}
                        <TabsContent value="permissions">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">
                                        User Permissions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-5">
                                        {/* Direct Permissions */}
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
                                                Direct Permissions
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-2"
                                                >
                                                    {direct_permissions.length}
                                                </Badge>
                                            </h3>
                                            {direct_permissions.length === 0 ? (
                                                <p className="text-sm text-gray-500">
                                                    No direct permissions
                                                    assigned to this user.
                                                </p>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {direct_permissions.map(
                                                        (permission) => (
                                                            <div
                                                                key={
                                                                    permission.id
                                                                }
                                                                className="flex items-center p-2 border rounded-md bg-gray-50"
                                                            >
                                                                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                                                <div>
                                                                    <p className="text-sm">
                                                                        {
                                                                            permission.name
                                                                        }
                                                                    </p>
                                                                    <div className="flex gap-1 mt-1">
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={getPermissionCategoryColor(
                                                                                getPermissionCategory(
                                                                                    permission.name
                                                                                )
                                                                            )}
                                                                        >
                                                                            {getPermissionCategory(
                                                                                permission.name
                                                                            )}
                                                                        </Badge>
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={getActionBadgeColor(
                                                                                getPermissionAction(
                                                                                    permission.name
                                                                                )
                                                                            )}
                                                                        >
                                                                            {getPermissionAction(
                                                                                permission.name
                                                                            )}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Role Permissions */}
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
                                                Role-based Permissions
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-2"
                                                >
                                                    {role_permissions.length}
                                                </Badge>
                                            </h3>
                                            {role_permissions.length === 0 ? (
                                                <p className="text-sm text-gray-500">
                                                    No role-based permissions
                                                    for this user.
                                                </p>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {role_permissions.map(
                                                        (permission) => (
                                                            <div
                                                                key={
                                                                    permission.id
                                                                }
                                                                className="flex items-center p-2 border rounded-md bg-gray-50"
                                                            >
                                                                <Shield className="h-4 w-4 text-indigo-500 mr-2" />
                                                                <div>
                                                                    <p className="text-sm">
                                                                        {
                                                                            permission.name
                                                                        }
                                                                    </p>
                                                                    <div className="flex gap-1 mt-1">
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={getPermissionCategoryColor(
                                                                                getPermissionCategory(
                                                                                    permission.name
                                                                                )
                                                                            )}
                                                                        >
                                                                            {getPermissionCategory(
                                                                                permission.name
                                                                            )}
                                                                        </Badge>
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={getActionBadgeColor(
                                                                                getPermissionAction(
                                                                                    permission.name
                                                                                )
                                                                            )}
                                                                        >
                                                                            {getPermissionAction(
                                                                                permission.name
                                                                            )}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <Separator />

                                        {/* Permissions By Category */}
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
                                                Permissions By Category
                                            </h3>
                                            {Object.keys(
                                                permissions_by_category
                                            ).length === 0 ? (
                                                <p className="text-gray-500">
                                                    No permissions found.
                                                </p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {Object.entries(
                                                        permissions_by_category
                                                    ).map(
                                                        ([
                                                            category,
                                                            permissions,
                                                        ]) => (
                                                            <div
                                                                key={category}
                                                                className="border rounded-md p-3"
                                                            >
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`${getPermissionCategoryColor(
                                                                            category
                                                                        )} px-3 py-1`}
                                                                    >
                                                                        {
                                                                            category
                                                                        }
                                                                    </Badge>
                                                                    <Badge variant="secondary">
                                                                        {
                                                                            permissions.length
                                                                        }{" "}
                                                                        permissions
                                                                    </Badge>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    {permissions.map(
                                                                        (
                                                                            permission
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    permission.id
                                                                                }
                                                                                className="flex items-center p-2 border rounded-md bg-gray-50"
                                                                            >
                                                                                <Tag className="h-4 w-4 text-gray-500 mr-2" />
                                                                                <div>
                                                                                    <p className="text-sm">
                                                                                        {
                                                                                            permission.name
                                                                                        }
                                                                                    </p>
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className={`mt-1 ${getActionBadgeColor(
                                                                                            getPermissionAction(
                                                                                                permission.name
                                                                                            )
                                                                                        )}`}
                                                                                    >
                                                                                        {getPermissionAction(
                                                                                            permission.name
                                                                                        )}
                                                                                    </Badge>
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
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default UsersShow;

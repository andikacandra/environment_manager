"use client";

import { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Edit,
    Trash,
    Users,
    Calendar,
    Layers,
    UserPlus,
    MoreHorizontal,
    Search,
    Settings,
    Clock,
    Info,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import type { Group, GroupMember, PageProps } from "@/types";
import { formatDate } from "@/lib/utils";
import EditRoleModal from "./Partials/EditRoleModal";
import DeleteGroupMemberModal from "./Partials/DeleteGroupMemberModal";

interface GroupShowProps extends PageProps {
    group: Group;
    isAdmin: boolean;
    canCreateGroupMembers: boolean;
    canEditGroupMembers: boolean;
    canDeleteGroupMembers: boolean;
    canViewApplications: boolean;
}

const GroupShow = () => {
    const {
        group,
        isAdmin,
        canCreateGroupMembers,
        canEditGroupMembers,
        canDeleteGroupMembers,
        canViewApplications,
    } = usePage<GroupShowProps>().props;

    const [activeTab, setActiveTab] = useState("members");
    const [memberSearchTerm, setMemberSearchTerm] = useState("");
    const [appSearchTerm, setAppSearchTerm] = useState("");
    const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
    const [isDeleteMemberModalOpen, setIsDeleteMemberModalOpen] =
        useState(false);
    const [selectedMember, setSelectedMember] = useState<GroupMember | null>(
        null
    );
    const handleOpenEditModal = (member: GroupMember) => {
        if (isAdmin && canEditGroupMembers) {
            setSelectedMember(member);
            setIsEditRoleModalOpen(true);
        }
    };

    const handleCloseEditModal = () => {
        setIsEditRoleModalOpen(false);
        setSelectedMember(null);
    };

    const handleOpenDeleteModal = (member: GroupMember) => {
        if (canDeleteGroupMembers) {
            setSelectedMember(member);
            setIsDeleteMemberModalOpen(true);
        }
    };
    const handleCloseDeleteModal = () => {
        setIsDeleteMemberModalOpen(false);
        setSelectedMember(null);
    };

    const getRoleColor = (role: string) => {
        switch (role.toLowerCase()) {
            case "admin":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "member":
                return "bg-green-100 text-green-800 border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role.toLowerCase()) {
            case "admin":
                return <Settings className="h-3 w-3" />;
            case "member":
                return <Users className="h-3 w-3" />;
            default:
                return <Info className="h-3 w-3" />;
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    const getGroupColorGradient = () => {
        const hash = group.name.split("").reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);

        const hue = Math.abs(hash % 360);
        return `linear-gradient(135deg, hsl(${hue}, 80%, 45%), hsl(${
            (hue + 40) % 360
        }, 80%, 55%))`;
    };

    const filteredMembers = group.group_members.filter(
        (member) =>
            member.user.full_name
                .toLowerCase()
                .includes(memberSearchTerm.toLowerCase()) ||
            member.user.email
                .toLowerCase()
                .includes(memberSearchTerm.toLowerCase()) ||
            member.role.toLowerCase().includes(memberSearchTerm.toLowerCase())
    );

    const filteredApplications = group.applications.filter(
        (app) =>
            app.name.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
            (app.description &&
                app.description
                    .toLowerCase()
                    .includes(appSearchTerm.toLowerCase()))
    );

    return (
        <AuthenticatedLayout>
            <Head title={`Group: ${group.name}`} />

            <Breadcrumb
                items={[
                    { label: "Groups", href: route("groups.index") },
                    { label: group.name },
                ]}
            />

            <div className="mb-8 relative overflow-hidden rounded-xl bg-white shadow-md">
                <div className="relative z-1 px-6 py-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <div
                        className="h-24 w-24 flex-shrink-0 rounded-xl shadow-lg flex items-center justify-center text-white"
                        style={{ background: getGroupColorGradient() }}
                    >
                        <Users className="h-10 w-10" />
                    </div>

                    <div className="flex-grow text-center md:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                            {group.name}
                        </h1>
                        <p className="text-gray-600 max-w-2xl">
                            {group.description || (
                                <span className="text-gray-400 italic">
                                    No description provided
                                </span>
                            )}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>
                                    Created {formatDate(group.created_at)}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>
                                    Updated {formatDate(group.updated_at)}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Users className="h-4 w-4 text-gray-400" />
                                <span>
                                    {group.group_members.length} members
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Layers className="h-4 w-4 text-gray-400" />
                                <span>
                                    {group.applications.length} applications
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-6"
            >
                <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 lg:w-auto mb-6">
                    <TabsTrigger
                        value="members"
                        className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                    >
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Members ({group.group_members.length})</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger
                        value="applications"
                        className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
                    >
                        <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            <span>
                                Applications ({group.applications.length})
                            </span>
                        </div>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="mt-0">
                    <Card className="shadow-sm border-t-4 border-t-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between border-b bg-white px-6 py-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                Group Members
                            </CardTitle>
                            {canCreateGroupMembers && (
                                <Link
                                    href={route("groups.groupMembers.create", {
                                        group: group,
                                    })}
                                >
                                    <Button
                                        size="sm"
                                        className="gap-1 bg-blue-600 hover:bg-blue-700"
                                    >
                                        <UserPlus className="h-4 w-4" /> Add
                                        Member
                                    </Button>
                                </Link>
                            )}
                        </CardHeader>
                        <CardContent className="p-0">
                            {group.group_members.length > 0 ? (
                                <>
                                    <div className="border-b p-4 bg-gray-50">
                                        <div className="relative w-full max-w-sm mx-auto">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                type="text"
                                                placeholder="Search members by name, email or role..."
                                                className="pl-10 rounded-full"
                                                value={memberSearchTerm}
                                                onChange={(e) =>
                                                    setMemberSearchTerm(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50">
                                                    <TableHead className="font-semibold">
                                                        User
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Role
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Added
                                                    </TableHead>
                                                    {isAdmin && (
                                                        <TableHead className="text-right font-semibold">
                                                            Actions
                                                        </TableHead>
                                                    )}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredMembers.length > 0 ? (
                                                    filteredMembers.map(
                                                        (member) => (
                                                            <TableRow
                                                                key={member.id}
                                                                className="hover:bg-blue-50/40 transition-colors"
                                                            >
                                                                <TableCell>
                                                                    <div className="flex items-center gap-3">
                                                                        <Avatar className="h-9 w-9 border shadow-sm">
                                                                            <AvatarFallback className="bg-blue-100 text-blue-800">
                                                                                {getInitials(
                                                                                    member
                                                                                        .user
                                                                                        .full_name
                                                                                )}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div>
                                                                            <div className="font-medium">
                                                                                {
                                                                                    member
                                                                                        .user
                                                                                        .full_name
                                                                                }
                                                                            </div>
                                                                            <div className="text-sm text-gray-500">
                                                                                {
                                                                                    member
                                                                                        .user
                                                                                        .email
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        className={`${getRoleColor(
                                                                            member.role
                                                                        )} inline-flex items-center gap-1`}
                                                                    >
                                                                        {getRoleIcon(
                                                                            member.role
                                                                        )}
                                                                        {
                                                                            member.role
                                                                        }
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-sm text-gray-500">
                                                                    {formatDate(
                                                                        member.created_at
                                                                    )}
                                                                </TableCell>
                                                                {isAdmin && (
                                                                    <TableCell className="text-right">
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger
                                                                                asChild
                                                                            >
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-8 w-8 p-0 rounded-full"
                                                                                >
                                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                                    <span className="sr-only">
                                                                                        Actions
                                                                                    </span>
                                                                                </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent
                                                                                align="end"
                                                                                className="w-40"
                                                                            >
                                                                                {isAdmin &&
                                                                                    canEditGroupMembers && (
                                                                                        <DropdownMenuItem
                                                                                            onClick={() =>
                                                                                                handleOpenEditModal(
                                                                                                    member
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <Edit className="mr-2 h-4 w-4" />
                                                                                            <span>
                                                                                                Edit
                                                                                                Role
                                                                                            </span>
                                                                                        </DropdownMenuItem>
                                                                                    )}
                                                                                {canDeleteGroupMembers && (
                                                                                    <>
                                                                                        <DropdownMenuSeparator />
                                                                                        <DropdownMenuItem
                                                                                            className="text-red-600"
                                                                                            onClick={() =>
                                                                                                handleOpenDeleteModal(
                                                                                                    member
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <Trash className="mr-2 h-4 w-4" />
                                                                                            <span>
                                                                                                Remove
                                                                                                Member
                                                                                            </span>
                                                                                        </DropdownMenuItem>
                                                                                    </>
                                                                                )}
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </TableCell>
                                                                )}
                                                            </TableRow>
                                                        )
                                                    )
                                                ) : (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={4}
                                                            className="h-32 text-center"
                                                        >
                                                            <div className="flex flex-col items-center justify-center">
                                                                <Search className="h-8 w-8 text-gray-300 mb-2" />
                                                                <p className="text-gray-500 mb-1">
                                                                    No members
                                                                    match your
                                                                    search
                                                                </p>
                                                                <p className="text-sm text-gray-400">
                                                                    Try a
                                                                    different
                                                                    search term
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-12 text-center">
                                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                        <Users className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-medium mb-1">
                                        No members yet
                                    </h3>
                                    <p className="text-gray-500 max-w-sm mb-6">
                                        This group doesn't have any members yet.
                                        Add members to grant them access to
                                        group resources.
                                    </p>
                                    {canCreateGroupMembers && (
                                        <Link
                                            href={route(
                                                "groups.groupMembers.create",
                                                {
                                                    group: group,
                                                }
                                            )}
                                        >
                                            <Button className="gap-1 bg-blue-600 hover:bg-blue-700">
                                                <UserPlus className="h-4 w-4" />
                                                Add First Member
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="applications" className="mt-0">
                    <Card className="shadow-sm border-t-4 border-t-purple-500">
                        <CardHeader className="flex flex-row items-center justify-between border-b bg-white px-6 py-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Layers className="h-5 w-5 text-purple-600" />
                                Applications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {group.applications.length > 0 ? (
                                <>
                                    <div className="border-b p-4 bg-gray-50">
                                        <div className="relative w-full max-w-sm mx-auto">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                type="text"
                                                placeholder="Search applications..."
                                                className="pl-10 rounded-full"
                                                value={appSearchTerm}
                                                onChange={(e) =>
                                                    setAppSearchTerm(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                        {filteredApplications.length > 0 ? (
                                            filteredApplications.map((app) => (
                                                <Card
                                                    key={app.id}
                                                    className="overflow-hidden hover:shadow-md transition-shadow border"
                                                >
                                                    <CardHeader className="p-4 pb-2 border-b bg-gray-50">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <CardTitle className="text-base font-semibold">
                                                                    {app.name}
                                                                </CardTitle>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    Added{" "}
                                                                    {formatDate(
                                                                        app.created_at
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0 rounded-full"
                                                                    >
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                        <span className="sr-only">
                                                                            Actions
                                                                        </span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent
                                                                    align="end"
                                                                    className="w-48"
                                                                >
                                                                    {canViewApplications && (
                                                                        <DropdownMenuItem
                                                                            asChild
                                                                        >
                                                                            <Link
                                                                                href={route(
                                                                                    "applications.show",
                                                                                    app.id
                                                                                )}
                                                                            >
                                                                                <Eye className="mr-2 h-4 w-4" />{" "}
                                                                                View
                                                                                Application
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="p-4 pt-3">
                                                        <div className="text-sm text-gray-600 mb-4 min-h-[40px]">
                                                            {app.description ? (
                                                                app.description
                                                            ) : (
                                                                <span className="text-gray-400 italic">
                                                                    No
                                                                    description
                                                                    provided
                                                                </span>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
                                                <Search className="h-8 w-8 text-gray-300 mb-2" />
                                                <p className="text-gray-500 mb-1">
                                                    No applications match your
                                                    search
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    Try a different search term
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-12 text-center">
                                    <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                                        <Layers className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <h3 className="text-lg font-medium mb-1">
                                        No applications yet
                                    </h3>
                                    <p className="text-gray-500 max-w-sm mb-6">
                                        This group doesn't have any applications
                                        yet. Add applications to organize your
                                        software resources.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {selectedMember && isAdmin && canEditGroupMembers && (
                <EditRoleModal
                    isOpen={isEditRoleModalOpen}
                    onClose={handleCloseEditModal}
                    groupId={group.id}
                    groupMemberId={selectedMember.id}
                    userName={selectedMember.user.full_name}
                    userEmail={selectedMember.user.email}
                    currentRole={selectedMember.role}
                />
            )}
            {selectedMember && canDeleteGroupMembers && (
                <DeleteGroupMemberModal
                    isOpen={isDeleteMemberModalOpen}
                    onClose={handleCloseDeleteModal}
                    groupId={group.id}
                    groupMemberId={selectedMember.id}
                    memberName={selectedMember.user.full_name}
                    memberEmail={selectedMember.user.email}
                />
            )}
        </AuthenticatedLayout>
    );
};

export default GroupShow;

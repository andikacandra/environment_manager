"use client";

import { useState, useRef, useEffect } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowLeft,
    Loader2,
    User,
    Info,
    CheckCircle2,
    UserPlus,
    Search,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { User as UserType, Group, PageProps } from "@/types";

interface GroupMembersCreateProps extends PageProps {
    group: Group;
    users: UserType[];
}

const GroupMembersCreate = () => {
    const { group, users } = usePage<GroupMembersCreateProps>().props;
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus search input on component mount
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: "",
        role: "",
    });

    // Filter users based on search query
    const filteredUsers =
        searchQuery.length > 1
            ? users
                  .filter((user) => {
                      const query = searchQuery.toLowerCase();
                      return (
                          user.full_name.toLowerCase().includes(query) ||
                          user.email.toLowerCase().includes(query)
                      );
                  })
                  // Filter out users who are already members of this group
                  .filter(
                      (user) =>
                          !group.group_members.some(
                              (member) => member.user.id === user.id
                          )
                  )
            : [];

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };
    const selectUser = (user: UserType) => {
        setSelectedUser(user);
        setData("user_id", user.id.toString());
        setSearchQuery("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("groups.groupMembers.store", { group: group.id }));
    };
    return (
        <AuthenticatedLayout>
            <Head title={`Add Member to ${group.name}`} />

            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: "Groups", href: route("groups.index") },
                    {
                        label: group.name,
                        href: route("groups.show", { group: group.id }),
                    },
                    { label: "Add Member" },
                ]}
            />
            {/* Hero Header */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 shadow-lg">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.7))]"></div>
                <div className="relative px-6 py-8 sm:px-8 md:flex md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Add New Member
                        </h1>
                        <p className="mt-2 max-w-2xl text-indigo-100">
                            Add a team member to "{group.name}" group with the
                            appropriate role and permissions.
                        </p>
                    </div>
                    <Link
                        href={route("groups.show", {
                            group: group.id,
                        })}
                    >
                        <Button
                            variant="outline"
                            className="gap-1 bg-white/10 text-white backdrop-blur-sm border-white/20 hover:bg-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Group
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
                <Alert className="mb-6 border-green-200 bg-green-50 text-green-800 animate-in fade-in slide-in-from-top-5 duration-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                        Member added successfully to {group.name}!
                    </AlertDescription>
                </Alert>
            )}

            {/* Main Form */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b bg-gray-50/80 px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl text-gray-800">
                                Add Member to {group.name}
                            </CardTitle>
                            <CardDescription>
                                Find a user and assign an appropriate role
                            </CardDescription>
                        </div>
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
                            <UserPlus className="h-5 w-5" />
                        </div>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6 p-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">
                                        Find User{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 cursor-help text-gray-400" />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                                <p className="w-60 text-xs">
                                                    Search for users by name or
                                                    email to add to this group.
                                                    Only users who are not
                                                    already members will be
                                                    shown.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input
                                        type="search"
                                        ref={searchInputRef}
                                        placeholder="Search by name or email..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        disabled={processing}
                                    />
                                </div>

                                {searchQuery.length > 1 &&
                                    filteredUsers.length === 0 && (
                                        <div className="rounded-md bg-gray-50 p-4 mt-3">
                                            <div className="flex">
                                                <div className="text-sm text-gray-500">
                                                    No users found matching "
                                                    {searchQuery}" or all
                                                    matching users are already
                                                    members
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                {filteredUsers.length > 0 && (
                                    <div className="mt-2 border rounded-md max-h-60 overflow-y-auto shadow-sm">
                                        <ul className="divide-y divide-gray-200">
                                            {filteredUsers.map((user) => (
                                                <li
                                                    key={user.id}
                                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                                    onClick={() =>
                                                        selectUser(user)
                                                    }
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                                                                <User className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {
                                                                        user.full_name
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {user.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                selectUser(
                                                                    user
                                                                );
                                                            }}
                                                            className="text-xs"
                                                        >
                                                            Select
                                                        </Button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedUser && (
                                    <div className="mt-4 p-4 border rounded-md bg-blue-50 border-blue-200 shadow-sm animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 border border-indigo-200">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {selectedUser.full_name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {selectedUser.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-500 hover:text-gray-700"
                                                onClick={() => {
                                                    setSelectedUser(null);
                                                    setData("user_id", "");
                                                }}
                                            >
                                                Change
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {errors.user_id && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                                        {errors.user_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 pt-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="role"
                                        className="text-sm font-medium"
                                    >
                                        Role{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 cursor-help text-gray-400" />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                                <p className="w-60 text-xs">
                                                    Select the appropriate
                                                    permission level for this
                                                    user.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="relative">
                                    <Select
                                        value={data.role}
                                        onValueChange={(value) =>
                                            setData("role", value)
                                        }
                                        disabled={processing}
                                    >
                                        <SelectTrigger className="w-full pl-10">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">
                                                Admin
                                            </SelectItem>
                                            <SelectItem value="member">
                                                Member
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>
                                </div>
                                {errors.role ? (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                                        {errors.role}
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500">
                                        Group role determines what actions the
                                        user can perform
                                    </p>
                                )}
                            </div>
                        </div>

                        {Object.keys(errors).length > 0 &&
                            !errors.user_id &&
                            !errors.role && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        There was an error adding the member.
                                        Please try again.
                                    </AlertDescription>
                                </Alert>
                            )}
                    </CardContent>

                    <CardFooter className="flex justify-end gap-3 border-t bg-gray-50/80 px-6 py-4">
                        <Link
                            href={route("groups.show", {
                                group: group.id,
                            })}
                        >
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
                            disabled={!selectedUser || !data.role || processing}
                            className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-700 text-white hover:from-violet-700 hover:to-indigo-800 shadow-sm"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Adding Member...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4" />
                                    Add Member
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </AuthenticatedLayout>
    );
};
export default GroupMembersCreate;

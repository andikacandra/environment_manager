import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { router } from "@inertiajs/react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RoleEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    groupMemberId: string;
    userName: string;
    userEmail: string;
    currentRole: string;
}

const EditRoleModal = ({
    isOpen,
    onClose,
    groupId,
    groupMemberId,
    userName,
    userEmail,
    currentRole,
}: RoleEditModalProps) => {
    const [selectedRole, setSelectedRole] = useState(currentRole);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedRole(currentRole);
        }
    }, [isOpen, currentRole]);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    const handleUpdate = () => {
        if (selectedRole !== currentRole) {
            setIsUpdating(true);

            router.put(
                route("groups.groupMembers.update", {
                    group: groupId,
                    groupMember: groupMemberId,
                }),
                { role: selectedRole },
                {
                    onSuccess: () => {
                        onClose();
                    },
                    onError: () => {
                        setIsUpdating(false);
                    },
                    onFinish: () => {
                        setIsUpdating(false);
                    },
                }
            );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={!isUpdating ? onClose : undefined}>
            <DialogContent
                className="sm:max-w-md"
                onEscapeKeyDown={(e) => {
                    if (isUpdating) {
                        e.preventDefault();
                    }
                }}
                onInteractOutside={(e) => {
                    if (isUpdating) {
                        e.preventDefault();
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>Edit Member Role</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-3">
                    <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="h-10 w-10 border shadow-sm">
                            <AvatarFallback className="bg-gray-100 text-gray-800">
                                {getInitials(userName)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{userName}</div>
                            <div className="text-sm text-gray-500">
                                {userEmail}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={selectedRole}
                            onValueChange={setSelectedRole}
                            disabled={isUpdating}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500">
                            Role determines what actions the user can perform.
                        </p>
                    </div>
                </div>
                <DialogFooter className="sm:justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isUpdating}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleUpdate}
                        disabled={isUpdating || selectedRole === currentRole}
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Update Role"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditRoleModal;

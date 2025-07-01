import { useState } from "react";
import { router } from "@inertiajs/react";
import { Trash, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DeleteGroupMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    groupMemberId: string;
    memberName: string;
    memberEmail: string;
}

const DeleteGroupMemberModal = ({
    isOpen,
    onClose,
    groupId,
    groupMemberId,
    memberName,
    memberEmail,
}: DeleteGroupMemberModalProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(
            route("groups.groupMembers.destroy", {
                group: groupId,
                groupMember: groupMemberId,
            }),
            {
                onSuccess: () => {
                    onClose();
                },
                onError: () => {
                    setIsDeleting(false);
                },
                onFinish: () => {
                    setIsDeleting(false);
                },
            }
        );
    };

    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={!isDeleting ? onClose : undefined}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2 mb-1 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        <AlertDialogTitle>Remove Group Member</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription>
                        Are you sure you want to remove this member from the
                        group? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="my-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border shadow-sm">
                            <AvatarFallback className="bg-gray-100 text-gray-800">
                                {getInitials(memberName)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{memberName}</div>
                            <div className="text-sm text-gray-500">
                                {memberEmail}
                            </div>
                        </div>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={isDeleting}
                        className="border-gray-300"
                    >
                        Cancel
                    </AlertDialogCancel>

                    <Button
                        variant="destructive"
                        disabled={isDeleting}
                        onClick={handleDelete}
                        className="gap-1.5"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Removing...
                            </>
                        ) : (
                            <>
                                <Trash className="h-4 w-4" />
                                Remove Member
                            </>
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteGroupMemberModal;

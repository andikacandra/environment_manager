import { useState } from "react";
import { router } from "@inertiajs/react";
import { Loader2, Trash, AlertTriangle } from "lucide-react";
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

interface DeleteGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    groupName: string;
}

const DeleteGroupModal = ({
    isOpen,
    onClose,
    groupId,
    groupName,
}: DeleteGroupModalProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route("groups.destroy", groupId), {
            onSuccess: () => {
                onClose();
            },
            onError: () => {
                setIsDeleting(false);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
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
                        <AlertDialogTitle>Delete Group</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription>
                        Are you sure you want to delete the group{" "}
                        <span className="font-semibold">"{groupName}"</span>?
                        This action cannot be undone and all associated data
                        will be permanently removed.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="my-4 p-4 border border-red-100 rounded-md bg-red-50 text-red-800 text-sm">
                    <p className="font-medium mb-1">This will delete:</p>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                        <li>All group memberships</li>
                        <li>All associated applications</li>
                        <li>All environment values and configurations</li>
                    </ul>
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
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash className="h-4 w-4" />
                                Delete Group
                            </>
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteGroupModal;

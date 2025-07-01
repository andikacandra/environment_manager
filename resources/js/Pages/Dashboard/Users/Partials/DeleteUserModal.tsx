import { useState } from "react";
import { router } from "@inertiajs/react";
import { Trash } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    userName: string;
}

const DeleteUserModal = ({
    isOpen,
    onClose,
    userId,
    userName,
}: DeleteUserModalProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route("users.destroy", userId), {
            onSuccess: () => {
                setIsDeleting(false);
                onClose();
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-red-600">
                        <div className="flex items-center">
                            <Trash className="mr-2 h-5 w-5" />
                            Confirm User Deletion
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the user{" "}
                        <span className="font-semibold text-gray-700">
                            "{userName}"
                        </span>
                        ? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <p className="text-sm text-gray-500">
                        All associated data will be permanently removed.
                    </p>
                </div>
                <DialogFooter className="flex space-x-2 sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete User"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteUserModal;

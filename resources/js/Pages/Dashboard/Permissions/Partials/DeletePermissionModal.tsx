import { useState } from "react";
import { router } from "@inertiajs/react";
import { Lock, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeletePermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    permissionId: number | null;
    permissionName: string;
}

const DeletePermissionModal = ({
    isOpen,
    onClose,
    permissionId,
    permissionName,
}: DeletePermissionModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDelete = () => {
        if (!permissionId) return;

        setIsSubmitting(true);
        router.delete(route("permissions.destroy", permissionId), {
            onSuccess: () => {
                setIsSubmitting(false);
                onClose();
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <Lock className="h-5 w-5" />
                        Delete Permission
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the permission "
                        {permissionName}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-3">
                    <div className="flex items-center p-3 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                        <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                        <div className="text-sm">
                            <p className="font-medium">Warning:</p>
                            <p>
                                Deleting this permission will remove it from all
                                roles and users who currently have it assigned.
                                This may impact their ability to perform certain
                                actions.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Delete Permission
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeletePermissionModal;

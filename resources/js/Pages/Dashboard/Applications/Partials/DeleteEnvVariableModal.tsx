// filepath: c:\Bimo\Joki\Fatih\environment_manager_new\resources\js\Pages\Dashboard\Applications\Partials\DeleteEnvVariableDialog.tsx
import { router } from "@inertiajs/react";
import { EnvVariable } from "@/types";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteEnvVariableModalProps {
    isOpen: boolean;
    onClose: () => void;
    envVariable: EnvVariable | null;
    applicationId: string;
}

export default function DeleteEnvVariableModal({
    isOpen,
    onClose,
    envVariable,
    applicationId,
}: DeleteEnvVariableModalProps) {
    const confirmDelete = () => {
        if (!envVariable) return;

        router.delete(
            route("applications.envVariables.destroy", {
                application: applicationId,
                envVariable: envVariable.id,
            }),
            {
                onSuccess: () => {
                    onClose();
                },
                onError: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you sure you want to delete this variable?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the environment variable "
                        <span className="font-mono font-semibold">
                            {envVariable?.name}
                        </span>
                        " and all its values.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={confirmDelete}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        Delete Variable
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

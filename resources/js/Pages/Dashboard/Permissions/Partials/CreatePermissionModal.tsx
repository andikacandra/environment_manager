import { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";
import { Lock, Loader2, Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CreatePermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreatePermissionModal = ({
    isOpen,
    onClose,
}: CreatePermissionModalProps) => {
    const [permissionName, setPermissionName] = useState("");
    const [guardName, setGuardName] = useState("web");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus on the input field when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Handle permission creation submission
    const handleCreatePermission = () => {
        if (!permissionName.trim()) {
            setFormError("Permission name is required");
            return;
        }

        setIsSubmitting(true);
        setFormError("");

        router.post(
            route("permissions.store"),
            { name: permissionName, guard_name: guardName },
            {
                onSuccess: () => {
                    handleClose();
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    if (errors.name) {
                        setFormError(errors.name);
                    } else if (errors.guard_name) {
                        setFormError(errors.guard_name);
                    } else {
                        setFormError("An error occurred. Please try again.");
                    }
                },
            }
        );
    };

    const handleClose = () => {
        onClose();
        setPermissionName("");
        setGuardName("web");
        setFormError("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-emerald-600" />
                        Create Permission
                    </DialogTitle>
                    <DialogDescription>
                        Define a new permission for your application.
                        Permissions control what actions users can perform.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label
                            htmlFor="permission-name"
                            className="text-sm font-medium"
                        >
                            Permission Name{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="permission-name"
                            ref={inputRef}
                            placeholder="e.g., create-users, view-reports"
                            value={permissionName}
                            onChange={(e) => {
                                setPermissionName(e.target.value);
                                setFormError("");
                            }}
                            className={
                                formError && formError.includes("name")
                                    ? "border-red-300 focus-visible:ring-red-200"
                                    : ""
                            }
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500">
                            Use format: action-resource (e.g., create-users)
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor="guard-name"
                            className="text-sm font-medium"
                        >
                            Guard <span className="text-red-500">*</span>
                        </Label>
                        <select
                            id="guard-name"
                            value={guardName}
                            onChange={(e) => {
                                setGuardName(e.target.value);
                                setFormError("");
                            }}
                            className={cn(
                                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                formError && formError.includes("guard")
                                    ? "border-red-300 focus-visible:ring-red-200"
                                    : ""
                            )}
                            disabled={isSubmitting}
                        >
                            <option value="web">Web</option>
                            <option value="api">API</option>
                            <option value="sanctum">Sanctum</option>
                        </select>
                    </div>

                    {formError && (
                        <p className="text-xs text-red-600">{formError}</p>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreatePermission}
                        disabled={isSubmitting || !permissionName.trim()}
                        className="gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Create Permission
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePermissionModal;

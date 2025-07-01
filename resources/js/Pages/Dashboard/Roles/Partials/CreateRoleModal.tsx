import { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";
import { Shield, Loader2, Plus } from "lucide-react";
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

interface CreateRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateRoleModal = ({ isOpen, onClose }: CreateRoleModalProps) => {
    const [roleName, setRoleName] = useState("");
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

    const handleCreateRole = () => {
        if (!roleName.trim()) {
            setFormError("Role name is required");
            return;
        }

        setIsSubmitting(true);
        setFormError("");

        router.post(
            route("roles.store"),
            { name: roleName },
            {
                onSuccess: () => {
                    handleClose();
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    if (errors.name) {
                        setFormError(errors.name);
                    } else {
                        setFormError("An error occurred. Please try again.");
                    }
                },
            }
        );
    };

    const handleClose = () => {
        onClose();
        setRoleName("");
        setFormError("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-600" />
                        Create New Role
                    </DialogTitle>
                    <DialogDescription>
                        Enter a name for the new role. Click save when you're
                        done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label
                            htmlFor="role-name"
                            className="text-sm font-medium"
                        >
                            Role Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="role-name"
                            ref={inputRef}
                            placeholder="Enter role name"
                            value={roleName}
                            onChange={(e) => {
                                setRoleName(e.target.value);
                                setFormError("");
                            }}
                            className={
                                formError
                                    ? "border-red-300 focus-visible:ring-red-200"
                                    : ""
                            }
                            disabled={isSubmitting}
                        />
                        {formError && (
                            <p className="text-xs text-red-600">{formError}</p>
                        )}
                    </div>
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
                        onClick={handleCreateRole}
                        disabled={isSubmitting || !roleName.trim()}
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
                                Create Role
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateRoleModal;

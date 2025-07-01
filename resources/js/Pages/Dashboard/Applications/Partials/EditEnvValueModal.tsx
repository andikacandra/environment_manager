import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Check } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { EnvValue } from "@/types";

interface EditEnvValueModalProps {
    isOpen: boolean;
    onClose: () => void;
    envValue: EnvValue | null;
    applicationId: string;
}

export default function EditEnvValueModal({
    isOpen,
    onClose,
    envValue,
    applicationId,
}: EditEnvValueModalProps) {
    const [editedValue, setEditedValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset the editedValue whenever the envValue changes
    useEffect(() => {
        if (envValue) {
            setEditedValue(envValue.value || "");
        }
    }, [envValue]);

    const handleSaveEnvValue = () => {
        if (!envValue) return;

        setIsSubmitting(true);

        router.put(
            route("applications.envValues.update", {
                application: applicationId,
                envValue: envValue.id,
            }),
            {
                value: editedValue,
            },
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                    onClose();
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Environment Value</DialogTitle>
                    <DialogDescription>
                        Update the value for{" "}
                        <span className="font-mono font-semibold">
                            {envValue?.env_variable?.name}
                        </span>{" "}
                        in{" "}
                        <span className="font-semibold">
                            {envValue?.access_key?.env_type?.name} environment
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="env-value">Value</Label>
                        <Input
                            id="env-value"
                            value={editedValue}
                            onChange={(e) => setEditedValue(e.target.value)}
                            placeholder="Enter new value"
                            className="font-mono"
                        />
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
                        onClick={handleSaveEnvValue}
                        disabled={isSubmitting}
                        className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                    >
                        {isSubmitting ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Check className="h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

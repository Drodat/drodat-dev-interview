"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { getUserById, updateUserById, moveUserToOrganization } from "@/lib/data/users";
import { getOrganizations } from "@/lib/data/organizations";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface UserData {
    name: string;
    email: string;
    organization: string;
    role: string;
    avatarUrl: string;
    phone: string;
    location: string;
    department: string;
}

export function UserProfile({ userId }: { userId: string }) {
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [organizationId, setOrganizationId] = useState<string>("");
    const [orgOptions, setOrgOptions] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const load = async () => {
            const [user, orgs] = await Promise.all([getUserById(userId), getOrganizations()]);
            setOrgOptions(orgs.map(o => ({ id: o.id, name: o.name })));
            if (user) {
                setUserData({
                    name: user.name,
                    email: user.email,
                    organization: user.organizationName ?? user.organizationId,
                    role: user.role,
                    avatarUrl: "/avatars/placeholder.png",
                    phone: "",
                    location: "",
                    department: "",
                });
                setOrganizationId(user.organizationId);
            }
        };
        load();
    }, [userId]);

    const handleToggle = async () => {
        if (!isEditing) {
            setIsEditing(true);
            return;
        }
        if (userData) {
            await updateUserById(userId, { name: userData.name, email: userData.email });
            if (organizationId) {
                await moveUserToOrganization(userId, organizationId);
                const orgName = orgOptions.find(o => o.id === organizationId)?.name ?? organizationId;
                setUserData({ ...userData, organization: orgName });
            }
            toast.success("User updated");
            router.replace(`/user/${userId}`);
        }
        setIsEditing(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={userData?.avatarUrl ?? "/avatars/placeholder.png"} alt={userData?.name ?? "User"} />
                        <AvatarFallback className="bg-white/[0.03] text-white/60 text-xl">
                            {(userData?.name ?? "U").split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-2xl font-semibold text-white/90">{userData?.name ?? ""}</h2>
                        <p className="text-white/40">{userData?.email ?? ""}</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="text-white/60 border-white/[0.08] hover:bg-white/[0.02] hover:text-white"
                    onClick={handleToggle}
                >
                    {isEditing ? "Save" : "Edit Profile"}
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-white/60">Full Name</Label>
                    <Input
                        disabled={!isEditing}
                        value={userData?.name ?? ""}
                        onChange={(e) => setUserData(userData ? { ...userData, name: e.target.value } : null)}
                        className="border-white/[0.08]"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-white/60">Email</Label>
                    <Input
                        disabled={!isEditing}
                        value={userData?.email ?? ""}
                        onChange={(e) => setUserData(userData ? { ...userData, email: e.target.value } : null)}
                        className="border-white/[0.08]"
                    />
                </div>
       
            
                <div className="space-y-2">
                    <Label className="text-white/60">Organization</Label>
                    {isEditing ? (
                        <Select value={organizationId} onValueChange={setOrganizationId}>
                            <SelectTrigger className="border-white/[0.08] text-white">
                                <SelectValue placeholder="Select organization" />
                            </SelectTrigger>
                            <SelectContent>
                                {orgOptions.map(org => (
                                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input
                            disabled
                            value={userData?.organization ?? ""}
                            className="border-white/[0.08]"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationUsers } from "@/components/organizations/organization-users";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getOrganizationById } from "@/lib/data/organizations";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const organization = await getOrganizationById(id);
    if (!organization) {
        return { title: "Organization Not Found | Iris" };
    }
    return {
        title: `${organization.name} | Iris`,
        description: `Manage users and details for ${organization.name}.`,
    };
}

export const revalidate = 60;

export default async function OrganizationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const organization = await getOrganizationById(id);

    if (!organization) {
        notFound();
    }

    return (
        <div className="space-y-10">
            <div className="space-y-2">
                <div className="flex items-center gap-4">
                    <Link href="/organizations">
                        <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-white/90">{organization.name}</h1>
                        <p className="text-white/40">Manage organization details, users, and billing.</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="users" className="space-y-6">
                <TabsList className="bg-drodatDarkGray border border-white/[0.03]">
                    <TabsTrigger
                        value="users"
                        className="data-[state=active]:bg-white/[0.04] data-[state=active]:text-white text-white/60"
                    >
                        Users
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-6">
                    <Card className="p-6">
                        <OrganizationUsers organizationId={organization.id} />
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
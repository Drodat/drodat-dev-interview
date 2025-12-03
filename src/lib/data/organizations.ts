import { collection, doc, getDoc, getDocs, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface Organization {
    id: string;
    name: string;
    status: 'active' | 'inactive';
    createdAt: string;
    users: number;
}

export const getOrganizations = async (): Promise<Organization[]> => {
    const organizationsRef = collection(db, "organizations");
    const snapshot = await getDocs(organizationsRef);

    const results: Organization[] = [];
    for (const org of snapshot.docs) {
        const data = org.data();
        const usersRef = collection(db, "organizations", org.id, "users");
        const usersCountSnap = await getCountFromServer(usersRef);
        const createdAt = data?.createdAt?.toDate?.()?.toISOString().slice(0, 10) ?? "No Date"; 
        results.push({
            id: org.id,
            name: data?.name ?? "Unnamed",
            status: (data?.status ?? "active") as 'active' | 'inactive',
            users: usersCountSnap.data().count,
            createdAt,
        });
    }
    return results;
};

export const getOrganizationById = async (id: string): Promise<Organization | null> => {
    const ref = doc(db, "organizations", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    const usersRef = collection(db, "organizations", id, "users");
    const usersCountSnap = await getCountFromServer(usersRef);
    const createdAt = data?.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString().slice(0, 10) : undefined;
    return {
        id: snap.id,
        name: data?.name ?? "Unnamed",
        status: (data?.status ?? "active") as 'active' | 'inactive',
        users: usersCountSnap.data().count,
        createdAt,
    };
};

import { collection, collectionGroup, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface User {
    id: string;
    name: string;
    email: string;
    organizationId: string;
    organizationName: string;
    role: string;
    createdAt: string;
}

export const getUsersByOrganizationId = async (organizationId: string): Promise<User[]> => {
    const usersRef = collection(db, "organizations", organizationId, "users");
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const createdAt = data?.createdAt?.toDate?.()?.toISOString().slice(0, 10) ?? undefined;
        return {
            id: docSnap.id,
            name: data?.name ?? "Unnamed",
            email: data?.email ?? "",
            role: data?.role ?? "User",
            organizationId,
            organizationName: data?.organizationName,
            createdAt: createdAt ?? "No Date",  
        } satisfies User;
    });
};

export const getUserById = async (userId: string): Promise<User | null> => {
    const group = collectionGroup(db, "users");
    const snapshot = await getDocs(group);
    for (const docSnap of snapshot.docs) {
        if (docSnap.id === userId) {
            const data = docSnap.data();
            const orgRef = docSnap.ref.parent.parent!;
            const orgSnap = await getDoc(orgRef);
            const createdAt = data?.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString().slice(0, 10) : undefined;
            return {
                id: docSnap.id,
                name: data?.name ?? "Unnamed",
                email: data?.email ?? "",
                role: data?.role ?? "User",
                organizationId: orgRef.id,
                organizationName: orgSnap.exists() ? (orgSnap.data())?.name : undefined,
                createdAt,
            };
        }
    }
    return null;
};

export const updateUserById = async (userId: string, updates: Partial<Pick<User, 'name' | 'email' | 'role'>>): Promise<void> => {
    const group = collectionGroup(db, "users");
    const snapshot = await getDocs(group);
    for (const docSnap of snapshot.docs) {
        if (docSnap.id === userId) {
            await updateDoc(docSnap.ref, updates);
            return;
        }
    }
};

export const moveUserToOrganization = async (userId: string, newOrganizationId: string): Promise<void> => {
    const group = collectionGroup(db, "users");
    const snapshot = await getDocs(group);
    for (const docSnap of snapshot.docs) {
        if (docSnap.id === userId) {
            const data = docSnap.data();
            const newOrgRef = doc(db, "organizations", newOrganizationId);
            const newOrgSnap = await getDoc(newOrgRef);
            const newOrgName = newOrgSnap.exists() ? (newOrgSnap.data())?.name : undefined;
            const newUserRef = doc(db, "organizations", newOrganizationId, "users", userId);
            await setDoc(newUserRef, { ...data, organizationName: newOrgName });
            await deleteDoc(docSnap.ref);
            return;
        }
    }
};

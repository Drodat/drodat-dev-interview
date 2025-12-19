import { collection, getDocs, getCountFromServer, collectionGroup } from "firebase/firestore";
import { db } from "./config";

export async function getUserGrowthData() {
    try {
        const usersGroup = collectionGroup(db, 'users');
        const snapshot = await getDocs(usersGroup);
        
        const monthlyCount: Record<string, number> = {};
        const keysOrder: string[] = [];

        // Sort docs by createdAt
        const sortedDocs = snapshot.docs.sort((a, b) => {
            const dateA = a.data().createdAt?.toDate() || new Date(0);
            const dateB = b.data().createdAt?.toDate() || new Date(0);
            return dateA.getTime() - dateB.getTime();
        });

        sortedDocs.forEach(doc => {
            const data = doc.data();
            if (data.createdAt && data.createdAt.toDate) {
                const date = data.createdAt.toDate();
                const month = date.toLocaleString('en-US', { month: 'short' });
                const year = date.getFullYear().toString().slice(-2);
                const key = `${month} '${year}`;
                
                if (!monthlyCount[key]) {
                    monthlyCount[key] = 0;
                    keysOrder.push(key);
                }
                monthlyCount[key]++;
            }
        });

        return keysOrder.map(key => ({
            month: key,
            users: monthlyCount[key]
        }));

    } catch (error) {
        console.error("Error getting user growth data:", error);
        return [];
    }
}

export async function getTotalOrganizationsCount(): Promise<number> {
    try {
        const organizationsRef = collection(db, "organizations");
        const snapshot = await getCountFromServer(organizationsRef);
        return snapshot.data().count;
    } catch (error) {
        console.error("Error getting total organizations count:", error);
        return 0;
    }
}

export async function getTotalUsersCount(): Promise<number> {
    try {
        const organizationsRef = collection(db, "organizations");
        const organizationsSnapshot = await getDocs(organizationsRef);
        
        let totalUsers = 0;
        
        // Get users count from each organization
        for (const orgDoc of organizationsSnapshot.docs) {
            const usersRef = collection(db, "organizations", orgDoc.id, "users");
            const usersSnapshot = await getCountFromServer(usersRef);
            totalUsers += usersSnapshot.data().count;
        }
        
        return totalUsers;
    } catch (error) {
        console.error("Error getting total users count:", error);
        return 0;
    }
} 
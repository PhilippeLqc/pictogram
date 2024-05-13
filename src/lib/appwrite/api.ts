import { INewUser } from "@/types";
import { ID, Query } from 'appwrite';
import { account, appwriteConfig, avatars, database } from "./config";

export async function createUserAccount(user: INewUser){
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name,
        );

        if(!newAccount) throw new Error("Failed to create account");

        const avatarUrl = avatars.getInitials(user.name);

        const newUser = await saveUserToDb({
            accountId: newAccount.$id,
            email: newAccount.email,
            name: newAccount.name,
            imageUrl: avatarUrl,
            username: user.username,
        })
        
        return newUser;
    } catch (error) {
        console.error(error);
        return error;
    }
}

export async function saveUserToDb(user: {
    accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?: string;
}) {
    try {
        const newUser = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user,
        )
        return newUser;
    } catch (error) {
        console.error(error);
    }
}

export async function signinAccount(user: {
    email: string;
    password: string;
}) {
    try {
        const session = await account.createEmailPasswordSession(user.email, user.password);
        console.log({session});
        return session;
    } catch (error) {
        console.error(error);
        return error;
    }
}

export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();

        console.log({currentAccount});

        if (!currentAccount) throw Error;

        const currentUser = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.error(error);
    }
}
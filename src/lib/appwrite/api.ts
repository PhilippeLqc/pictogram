import { IComment, INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { ID, ImageGravity, Query } from 'appwrite';
import { account, appwriteConfig, avatars, database, storage } from "./config";

// MEDIA API -----------------------------------------------------------------------
export async function uploadFile(file: File) {
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file
        );
        return uploadedFile;
    } catch (error) {
        console.error(error);
    }
}

export function getFilePreview(fileId: string) {
    try {
        const fileUrl = storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            ImageGravity.Top,
            100,
        );
        return fileUrl;
    } catch (error) {
        console.error(error);
    }
}

export async function deleteFile(fileId: string) {
    try {
        await storage.deleteFile(appwriteConfig.storageId, fileId);
        return { status: 'success'};
    } catch (error) {
        console.error(error);
    }
}

// ACCOUNT API -----------------------------------------------------------------------
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

export async function signOutAccount() {
    try {
        const session = await account.deleteSession('current');
        return session;
    } catch (error) {
        console.error(error);
    }
}

// USER API -----------------------------------------------------------------------
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

export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();

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

export async function getUsers(limit?: number) {
    try {
        const users = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [limit ? `${Query.orderDesc('$createdAt'), Query.limit(limit)}` : Query.orderDesc('$createdAt')]
        )

        if (!users) throw Error;
        
        return users;
    } catch (error) {
        console.error(error);
    }
}

export async function getUserById(userId: string) {
    try {
        const user = await database.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId,
        )

        if (!user) throw Error;

        return user;
    } catch (error) {
        console.error(error);
    }
}

export async function updateProfile(user: IUpdateUser) {
    const hasFileToUpdate = user.file.length > 0;
    try {
        let image = {
            imageUrl: user.imageUrl,
            imageId: user.imageId,
        }

        if (hasFileToUpdate) {
            // Upload file to storage
            const uploadedFile = await uploadFile(user.file[0]);
            if (!uploadedFile) throw Error;
            // Get file url
            const fileUrl = getFilePreview(uploadedFile.$id);
    
            if (!fileUrl) {
                deleteFile(uploadedFile.$id);
                throw Error
            }

            image = {...image, imageUrl: fileUrl, imageId: uploadedFile.$id};
        }

        // save profile to db
        const updatedUser = await database.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            user.userId,
            {
                name: user.name,
                username: user.username,
                bio: user.bio,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
            }
        )

        if (!updatedUser) {
            await deleteFile(user.imageId);
            throw Error;
        }
        return updatedUser;
    } catch (error) {
        console.error(error);
    }

}

// POST API -----------------------------------------------------------------------
export async function createPost(post: INewPost) {
    try {
        // Upload file to storage
        const uploadedFile = await uploadFile(post.file[0]);

        if (!uploadedFile) throw Error;

        // Get file url
        const fileUrl = getFilePreview(uploadedFile.$id);

        if (!fileUrl) {
            deleteFile(uploadedFile.$id);
            throw Error
        }
        // convert tags to array
        const tags = post.tags?.replace(/ /g, '').split(',') || [];

        // save post to db
        const newPost = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageUrl: fileUrl,
                imageId: uploadedFile.$id,
                location: post.location,
                tags: tags,
            }
        )

        if (!newPost) {
            await deleteFile(uploadedFile.$id);
            throw Error;
        }
        return newPost;
    } catch (error) {
        console.error(error);
    }

}

export async function deletePost(postId: string, imageId: string) {
    if (!postId || !imageId) throw Error;
    
    try {
        const statusCode = await database.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
        )

        if (!statusCode) throw Error;

        return { status: 'success'};
    } catch (error) {
        console.error(error);
    }
}

export async function updatePost(post: IUpdatePost) {
    const hasFileToUpdate = post.file.length > 0;
    try {
        let image = {
            imageUrl: post.imageUrl,
            imageId: post.imageId,
        }

        if (hasFileToUpdate) {
            // Upload file to storage
            const uploadedFile = await uploadFile(post.file[0]);
            if (!uploadedFile) throw Error;
            // Get file url
            const fileUrl = getFilePreview(uploadedFile.$id);
    
            if (!fileUrl) {
                deleteFile(uploadedFile.$id);
                throw Error
            }

            image = {...image, imageUrl: fileUrl, imageId: uploadedFile.$id};
        }

        // convert tags to array
        const tags = post.tags?.replace(/ /g, '').split(',') || [];

        // save post to db
        const updatedPost = await database.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            post.postId,
            {
                caption: post.caption,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
                location: post.location,
                tags: tags,
            }
        )

        if (!updatedPost) {
            await deleteFile(post.imageId);
            throw Error;
        }
        return updatedPost;
    } catch (error) {
        console.error(error);
    }

}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
    const queries: string[] = [Query.orderDesc('$updatedAt'), Query.limit(10)];
    if (pageParam) {
        queries.push(Query.cursorAfter(pageParam.toString()));
    }

    try {
        const posts = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            queries
        )

        if (!posts) throw Error;
        
        return posts;
    } catch (error) {
        console.error(error);
    }
}

export async function searchPosts(searchTerm: string) {

    try {
        const posts = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.search('caption', searchTerm)]
        )

        if (!posts) throw Error;
        
        return posts;
    } catch (error) {
        console.error(error);
    }
}

export async function getRecentPosts() {
    try {
        const posts = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.orderDesc('$createdAt'), Query.limit(20)]
        )

        if (!posts) throw Error;
        
        return posts;
    } catch (error) {
        console.error(error);
    }
}

export async function getPostsById(postId: string) {
    try {
        const post = await database.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
        )

        if (!post) throw Error;

        return post;
    } catch (error) {
        console.error(error);
    }
}

export async function getUserPosts(userId: string) {
    try {
        const posts = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.equal('creator', userId)]
        )
    
        if (!posts) throw Error;
    
        return posts;
    } catch (error) {
        console.error(error);
    }
    }
    
// FOLLOW API -----------------------------------------------------------------------

export async function followUser(userId: string, followerId: string) {
    try {
        const updatedUser = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.followCollectionId,
            ID.unique(),
            {
                follower: followerId,
                user: userId,
            }
        )

        if (!updatedUser) throw Error;

        return updatedUser;
    } catch (error) {
        console.error(error);
    }

}

export async function unfollowUser(followId: string) {
    try {
        const statusCode = await database.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.followCollectionId,
            followId,
        )

        if (!statusCode) throw Error;

        return { status: 'success'};
    } catch (error) {
        console.error(error);
    }
}

export async function getFollowers(userId: string) {
    try {
        const followers = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.followCollectionId,
            [Query.equal('user', userId)]
        );

        if (!followers || followers.documents.length === 0) return [];

        return followers.documents;
    } catch (error) {
        console.error("Error fetching followers:", error);
        return [];
    }
}

export async function getFollowing(userId: string) {
    try {
        const following = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.followCollectionId,
            [Query.equal('follower', userId)]
        )

        if (!following || following.documents.length === 0) return [];

        return following.documents.map(doc => doc.userId);
    } catch (error) {
        console.error(error);
    }
}

// LIKE API -----------------------------------------------------------------------

export async function likePost(postId: string, likesArray: string[]) {
    try {
        const updatedPost = await database.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes: likesArray,
            }
        )

        if (!updatedPost) throw Error;

        return updatedPost;
    } catch (error) {
        console.error(error);
    }
}

// SAVE POST API -----------------------------------------------------------------------

export async function savePost(post: string, user: string) {
    try {
        const updatedPost = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                post: post,
                user: user,
            }
        )

        if (!updatedPost) throw Error;

        return updatedPost;
    } catch (error) {
        console.error(error);
    }
}

export async function deleteSavePost(savedRecordId: string) {
    try {
        const statusCode = await database.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedRecordId,
        )

        if (!statusCode) throw Error;

        return { status: 'success'};
    } catch (error) {
        console.error(error);
    }
}

export async function deleteMultipleSavePost(savedRecordId: string[]) {
    try {
        savedRecordId.forEach(async (id) => {
            await database.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.savesCollectionId,
                id,
            )
        })
        return { status: 'success'};
    } catch (error) {
        console.error(error);
    }
}

// COMMENT API -----------------------------------------------------------------------

export async function createComment(comment: IComment) {
    try {
        const newComment = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.commentsCollectionId,
            ID.unique(),
            {
                post_id: comment.post_id,
                user_id: [comment.user_id],
                content: comment.content,
            }
        )

        return newComment;
    } catch (error) {
        console.error(error);
    }
}

export async function getComments(postId: string) {
    try {
        const comments = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.commentsCollectionId,
            [Query.equal('post_id', postId)]
        )

        if (!comments) throw Error;

        return comments;
    } catch (error) {
        console.error(error);
    }
}

export async function deleteComments(commentId: string[]) {
try {
    commentId.forEach(async (id) => {
        await database.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.commentsCollectionId,
            id,
        )
    })
    return { status: 'success'};
} catch (error) {
    console.error(error);
}
}



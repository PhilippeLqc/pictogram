import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from '@tanstack/react-query';
import { createComment, createPost, createUserAccount, deleteComment, deletemultipleComments, deleteMultipleSavePost, deletePost, deleteSavePost, followUser, getComments, getCurrentUser, getFollowers, getFollowing, getInfinitePosts, getPostsById, getRecentPosts, getUserById, getUserPosts, getUsers, likePost, savePost, searchPosts, signinAccount, signOutAccount, unfollowUser, updatePost, updateProfile } from '../appwrite/api';
import { IComment, INewPost, INewUser, IUpdatePost, IUpdateUser } from '@/types';
import { QUERY_KEYS } from './queryKeys';


// ACCOUNT QUERY ----------------------------
export const useSigninAccount = () => {
    return useMutation({
        mutationFn: (user: {
            email: string; 
            password: string 
        }) => signinAccount(user)
    }) 
};

export const useSignOutAccount = () => {
    return useMutation({
        mutationFn: signOutAccount
    })
};

// USER QUERY ----------------------------
export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user)
    }) 
};

export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        queryFn: getCurrentUser,
    })
};

export const useGetUserById = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
        queryFn: () => getUserById(userId),
        enabled: !!userId
    })
}

export const useGetUsers = (limit?: number) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USERS],
        queryFn: () => getUsers(limit),
    });
}; 

export const useUpdateProfile = () => {
    const QueryClient = useQueryClient();
    return useMutation({
        mutationFn: (user: IUpdateUser) => updateProfile(user),
        onSuccess: (data) => {
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER, data?.$id]
            })
        }
    })
};

// POST QUERY ----------------------------
export const useCreatePost = () => {
    const QueryClient = useQueryClient();

    return useMutation({
        mutationFn: (post: INewPost) => createPost(post),
        onSuccess: () => {
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        }
    })
}

export const useUpdatePost = () => {
    const QueryClient = useQueryClient();
    return useMutation({
        mutationFn: (post: IUpdatePost) => updatePost(post),
        onSuccess: (data) => {
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
            })
        }
    })
};

export const useDeletePost = () => {
    const QueryClient = useQueryClient();
    const deleteMultipleItems = async ({ postId, imageId, savedRecordId, commentId}: {postId: string, imageId: string, savedRecordId: string[], commentId: string[]}) => {
        await deleteMultipleSavePost(savedRecordId);
        await deletemultipleComments(commentId);
        await deletePost(postId, imageId);
    }
    return useMutation({
        mutationFn: deleteMultipleItems,
        onSuccess: () => {
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        }
    })
};

export const useGetRecentPosts = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        queryFn: getRecentPosts,
    })
}

export const useGetPosts = () => {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
        queryFn: getInfinitePosts,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getNextPageParam: (lastPage: any) => {

            if(lastPage && lastPage.documents.length === 0) {
                return null;
            }

            const lastId = lastPage?.documents[lastPage.documents.length - 1].$id;

            return lastId;
        },
        initialPageParam: null
    });
};

export const useSearchPosts = (searchTerm: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
        queryFn: () => searchPosts(searchTerm),
        enabled: !!searchTerm
    })
};

// FOLLOW QUERY ----------------------------
export const useFollowUser = () => {
    const QueryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, followerId}: {userId: string, followerId: string}) => followUser(userId, followerId),
        onSuccess: () => {
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_USERS]
            })
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_FOLLOWERS]
            })
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_FOLLOWING]
            })
        }
    })
};

export const useGetFollowers = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_FOLLOWERS, userId],
        queryFn: () => getFollowers(userId),
    })
}

export const useGetFollowing = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_FOLLOWING, userId],
        queryFn: () => getFollowing(userId),
    })
}

export const useUnfollowUser = () => {
    const QueryClient = useQueryClient();
    return useMutation({
        mutationFn: (followId: string) => unfollowUser(followId),
        onSuccess: () => {
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

// LIKE QUERY ----------------------------
export const useLikePost = () => {
    const QueryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, likesArray}: {postId: string, likesArray: string[]}) => likePost(postId, likesArray),
        onSuccess: (data) => {
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
            })
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

// SAVE POST QUERY ----------------------------
export const useSavePost = () => {
    const QueryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ post, user}: {post: string, user: string}) => savePost(post, user),
        onSuccess: () => {
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useDeleteSavedPost = () => {
    const QueryClient = useQueryClient();

    return useMutation({
        mutationFn: (savedRecordId: string) => deleteSavePost(savedRecordId),
        onSuccess: () => {
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useGetPostsById = (postId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
        queryFn: () => getPostsById(postId),
        enabled: !!postId
    })
};

export const useGetUserPosts = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
        queryFn: () => getUserPosts(userId),
        enabled: !!userId
    })
}

// COMMENT QUERY ----------------------------
export const useCreateComment = () => {
    const QueryClient = useQueryClient();
    return useMutation({
        mutationFn: (comment: IComment) => createComment(comment),
        onSuccess: () => {
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID]
            })
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_COMMENTS]
            })
        }
    })
}

export const useGetComments = (postId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_COMMENTS, postId],
        queryFn: () => getComments(postId),
        enabled: !!postId
    })
}

export const useDeleteComment = () => {
    const QueryClient = useQueryClient();
    return useMutation({
        mutationFn: (commentId: string) => deleteComment(commentId),
        onSuccess: () => {
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_COMMENTS]
            })
        }
    })
}




















import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from '@tanstack/react-query';
import { createPost, createUserAccount, deletePost, deleteSavePost, followUser, getCurrentUser, getFollowers, getFollowing, getInfinitePosts, getPostsById, getRecentPosts, getUserById, getUsers, likePost, savePost, searchPosts, signinAccount, signOutAccount, updatePost, updateProfile } from '../appwrite/api';
import { INewPost, INewUser, IUpdatePost, IUpdateUser } from '@/types';
import { QUERY_KEYS } from './queryKeys';


export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user)
    }) 
};

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

export const useGetRecentPosts = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        queryFn: getRecentPosts,
    })
}

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

export const useGetPostsById = (postId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
        queryFn: () => getPostsById(postId),
        enabled: !!postId
    })
};

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
    return useMutation({
        mutationFn: ({postId, imageId}: {postId: string, imageId: string}) => deletePost(postId, imageId),
        onSuccess: () => {
            QueryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        }
    })
};

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

export const useGetUsers = (limit?: number) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USERS],
        queryFn: () => getUsers(limit),
    });
}; 

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

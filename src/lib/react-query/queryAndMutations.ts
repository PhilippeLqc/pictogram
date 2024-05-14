import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
    dataTagSymbol,
} from '@tanstack/react-query';
import { createPost, createUserAccount, deletePost, deleteSavePost, getCurrentUser, getPostsById, getRecentPosts, likePost, savePost, signinAccount, signOutAccount, updatePost } from '../appwrite/api';
import { INewPost, INewUser, IUpdatePost } from '@/types';
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
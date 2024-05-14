import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from '@tanstack/react-query';
import { createPost, createUserAccount, deleteSavePost, getCurrentUser, getRecentPosts, likePost, savePost, signinAccount, signOutAccount } from '../appwrite/api';
import { INewPost, INewUser } from '@/types';
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
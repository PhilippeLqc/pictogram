import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from '@tanstack/react-query';
import { createPost, createUserAccount, getRecentPosts, signinAccount, signOutAccount } from '../appwrite/api';
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
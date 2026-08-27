"use client";

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import { Spinner } from '@/components/ui/spinner';


export default function AuthCallbackPage() {

    const router = useRouter();
    const { data : user, isLoading, isError , isFetched } = useCurrentUser();

    useEffect(() => {
        if (!isFetched || isLoading) return;

        if(user){
            router.replace("/dashboard");
            return;
        }

        router.replace("/login?error=session");

    }, [user, isFetched, isLoading, isError, router]);

    return (
        <div className='flex min-h-svh flex-col items-center justify-center gap-3'>
            <Spinner className='size-8' />
            <p className='text-sm text-muted-foreground'>
                Redirecting...
            </p>
        </div>
    )
}

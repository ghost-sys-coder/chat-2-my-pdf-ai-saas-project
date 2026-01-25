"use client";
import React, { useState } from 'react'
import { Button } from '../ui/button'
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface SubscriptionBtnProps {
    isValid: boolean | undefined;
}

const SubscriptionsBtn: React.FC<SubscriptionBtnProps> = ({ isValid }) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStripeSubscription = async () => {
        setIsSubmitting(true);
        try {
            const { data, status } = await axios.get("/api/stripe");
            if (status === 201 || status === 200 && data.success) {
                router.push(data.url);
            }
        } catch (error) {
            console.error("Failed to connect to stripe!", error);
            toast.error((error as Error).message || "Failed to connect to stripe, try again!");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Button
            onClick={handleStripeSubscription}
            disabled={isSubmitting}
            className=''
        >
            {isSubmitting ? (
                <span className='flex gap-2 items-center justify-center'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span>Redirecting...</span>
                </span>
            ) : (
                <span>{isValid ? "Manage Subscriptions" : "Upgrade to Pro"}</span>
            )}
        </Button>
    )
}

export default SubscriptionsBtn
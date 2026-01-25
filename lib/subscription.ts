"use server";

import { db } from "@/db";
import { userSubscriptionTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

const day_in_ms = 1000 * 24 * 60 * 60;

export const checkSubscription = async () => {
    const { userId } = await auth();

    if (!userId) {
        return {
            message: "Authorization required!",
            success: false
        }
    }

    const [subscription] = await db.select()
        .from(userSubscriptionTable)
        .where(eq(userSubscriptionTable.userId, userId)).limit(1);
    
    if (!subscription) {
        return {
            message: "No ssubscription found!",
            success: false
        }
    }

    const periodEnd = subscription.stripeCurrentPeriodEnd?.getTime() ?? 0;

    const isValid = Boolean(subscription.stripePriceId) && periodEnd + day_in_ms > Date.now();

    return {
        success: true,
        message: "Subscription is still valid!",
        isValid
    }
}
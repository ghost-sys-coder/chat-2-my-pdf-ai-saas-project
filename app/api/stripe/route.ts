import { db } from "@/db";
import { userSubscriptionTable } from "@/db/schema";
import { stripeClient } from "@/lib/stripe";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const return_url = process.env.NEXT_BASE_URL + "/";

export async function GET() {
    const { userId } = await auth();

    const user = await currentUser();

    if (!userId) {
        return NextResponse.json({
            success: false,
            message: "Not Authorized..."
        }, { status: 401 });
    }

    try {
        const [userSubscriptions] = await db.select()
        .from(userSubscriptionTable)
            .where(eq(userSubscriptionTable.userId, userId));
        
        // if the user is already subscribed, cancel subscription
        if (userSubscriptions && userSubscriptions.stripeCustomerId) {
            const stripeSession = await stripeClient.billingPortal.sessions.create({
                customer: userSubscriptions.stripeCustomerId,
                return_url
            });

            return NextResponse.json({
                success: true,
                url: stripeSession.url
            }, { status: 200 });
        }

        // for a customer trying to subscribe
        const stripeCheckout = await stripeClient.checkout.sessions.create({
            success_url: return_url,
            cancel_url: return_url,
            payment_method_types: ["card", "amazon_pay"],
            mode: "subscription",
            billing_address_collection: "auto",
            customer_email: user?.emailAddresses[0].emailAddress,
            line_items: [
                {
                    price_data: {
                        currency: "USD",
                        product_data: {
                            name: "CHAT-2-MY-PDF PRO",
                            description: "Unlimited PDF sessions"
                        },
                        unit_amount: 5000,
                        recurring: {
                            interval: "month"
                        }
                    },
                    quantity: 1
                }
            ],
            metadata: {
                userId
            }
        });

        return NextResponse.json({
            success: true,
            message: "Your payment has been succesful!",
            url: stripeCheckout.url
        }, { status: 201 });
    } catch (error) {
        console.error("Failed to make stripe payment!", error);
        return NextResponse.json({
            success: false,
            message: (error as Error).message || "Failed to make stripe connect!"
        }, { status: 500 });
    }
}
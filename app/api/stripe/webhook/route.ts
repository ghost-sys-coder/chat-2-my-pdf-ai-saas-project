import { db } from "@/db";
import { userSubscriptionTable } from "@/db/schema";
import { stripeClient } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = (await headers()).get("stripe-signature") as string;
    let event: Stripe.Event;

    // I am not getting these in my logs -- I am thinking my api/webhook is not hit
    console.log({ body, signature });


    try {
        event = stripeClient.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (error) {
        console.error("Something failed in the stripe webhook", error);
        return NextResponse.json({
            success: false,
            message: (error as Error).message || "Something went wrong!"
        }, { status: 400 });
    }

    
    // handle stripe events
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;

            console.log({ session });

            const subscription = await stripeClient.subscriptions.retrieve(
                session.subscription as string
            );
            
            // get userId that was sent as metadata to stripe
            const userId = session.metadata?.userId;
            if (!userId) {
                console.error("No userId in session metadata");
                return NextResponse.json({
                    success: false,
                    message: "No user Id found in stripe metadata"
                }, { status: 400 });
            }

            try {
                await db.insert(userSubscriptionTable).values({
                    userId: session.metadata?.userId ?? "",
                    stripSubscriptionId: subscription.id,
                    stripeCustomerId: subscription.customer as string,
                    stripePriceId: subscription.items.data[0].price.id,
                    stripeCurrentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000)
                });
                return NextResponse.json({ received: true, success: true }, { status:  200});
            } catch (error) {
                console.error("Failed to save transaction details", error);
            }
        };
            
        case "invoice.payment_succeeded": {
            const session = event.data.object as Stripe.Checkout.Session;

            console.log({ session });
            
            const subscription = await stripeClient.subscriptions.retrieve(
                session.subscription as string
            );

            try {
                await db.update(userSubscriptionTable).set({
                    stripePriceId: subscription.items.data[0].price.id,
                    stripeCurrentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000)
                }).where(eq(userSubscriptionTable.stripSubscriptionId, subscription.id));
                return NextResponse.json({ received: true, success: true }, { status: 200});
            } catch (error) {
                console.error("Something went wrong!", error);
            }
        }
        default:
            return NextResponse.json({
                success: true,
                message: "Payment successful"
            }, { status: 200 });
    }
}
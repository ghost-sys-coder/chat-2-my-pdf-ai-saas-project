ALTER TABLE "user_subscriptions" DROP CONSTRAINT "user_subscriptions_stripe_subscription_id_unique";--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "user_subscriptions" DROP COLUMN "stripe_subscription_id";--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_stripe_customer_id_unique" UNIQUE("stripe_customer_id");
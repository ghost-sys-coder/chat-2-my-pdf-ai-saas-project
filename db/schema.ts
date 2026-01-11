import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const userSystemEnum = pgEnum("user_system_enum", [
    "system", "user"
])

export const chatsTable = pgTable("chats", {
    id: serial("id").primaryKey(),
    pdfName: text("pdf_name").notNull(),
    pdfUrl: text("pdf_url").notNull(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    fileKey: text("file_key").notNull()
});

export const messagesTable = pgTable("messages", {
    id: serial("id").primaryKey(),
    chatId: integer("chat_id").references(() => chatsTable.id).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    role: userSystemEnum("role").notNull()
})
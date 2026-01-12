# 📄 Chat With Your PDF — AI SaaS

An AI-powered web application that allows users to upload PDFs and interact with them conversationally using Retrieval Augmented Generation (RAG).

Built with a modern, scalable stack using **Next.js App Router**, **Clerk Authentication**, **AWS S3**, and **Vector Search**.

---

## 🚀 Preview

![Chat with PDF preview](./assets/home-page.png)

> Upload a PDF → Ask questions → Get instant AI-powered answers.

---

## 🧱 Tech Stack

### 🌐 Frontend & Platform

- **Next.js (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **TanStack / React Query**
- **Vercel**

### 🔐 Authentication & Payments

- **Clerk Authentication**
- **Stripe** (subscriptions & billing)

### 🗄️ Database & Storage

- **Neon (PostgreSQL)**
- **Drizzle ORM**
- **AWS S3** (PDF storage)

### 🤖 AI & RAG Stack

- **OpenAI**
- **LangChain**
- **Pinecone (Vector DB)**
- **Vercel AI SDK**

---

## 🧠 Core Concepts Used

- Edge Runtime
- Server Actions
- Retrieval Augmented Generation (RAG)
- Vector Embeddings
- Pre-signed S3 URLs
- Secure multi-tenant SaaS architecture

---

## ✨ Features

- 🔐 Secure authentication with Clerk
- 📤 PDF upload with AWS S3
- 💬 Chat with your documents using AI
- 🧠 Context-aware answers (RAG)
- ⚡ Fast, streaming responses
- 📊 Persistent chat history
- 🔒 User-level file isolation
- 💳 Subscription-ready with Stripe

---

## 🏗️ Architecture Overview

**Flow:**

1. User uploads PDF
2. File stored securely in S3
3. Text extracted & chunked
4. Embeddings stored in Pinecone
5. Queries answered using OpenAI + vector search

---

## 📂 Project Structure

```txt
.
├── app/
│   ├── api/
│   │   ├── s3/upload
│   │   ├── chat/create
│   ├── (auth)/
│   ├── (dashboard)/
│   └── page.tsx
├── components/
├── db/
│   ├── schema.ts
│   └── index.ts
├── lib/
│   ├── aws-s3.server.ts
│   ├── embeddings.ts
│   └── openai.ts
├── providers/
├── assets/
├── public/
└── README.md

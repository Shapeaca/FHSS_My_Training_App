-- CreateEnum
CREATE TYPE "public"."ByuAccountType" AS ENUM ('NonByu', 'Student', 'Employee', 'ServiceAccount');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('INCOMPLETE', 'COMPLETE', 'IN_PROGRESS');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLogin" TIMESTAMP(3),
    "roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "canProxyUntil" TIMESTAMP(3),
    "accountType" "public"."ByuAccountType" NOT NULL,
    "netId" TEXT NOT NULL,
    "byuId" TEXT,
    "workerId" TEXT,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "suffix" TEXT,
    "preferredFirstName" TEXT NOT NULL,
    "preferredLastName" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JwtBlacklist" (
    "id" TEXT NOT NULL,
    "exp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JwtBlacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedDate" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "completedDate" TIMESTAMP(3),
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_netId_key" ON "public"."User"("netId");

-- CreateIndex
CREATE INDEX "JwtBlacklist_exp_idx" ON "public"."JwtBlacklist"("exp");

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

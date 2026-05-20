-- CreateTable
CREATE TABLE "sms_reminders" (
    "id" TEXT NOT NULL,
    "emiId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sms_reminders_emiId_key" ON "sms_reminders"("emiId");

-- AddForeignKey
ALTER TABLE "sms_reminders" ADD CONSTRAINT "sms_reminders_emiId_fkey" FOREIGN KEY ("emiId") REFERENCES "emi_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

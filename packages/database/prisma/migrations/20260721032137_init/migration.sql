-- CreateTable
CREATE TABLE "platform_meta" (
    "id" SERIAL NOT NULL,
    "bootstrappedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_meta_pkey" PRIMARY KEY ("id")
);

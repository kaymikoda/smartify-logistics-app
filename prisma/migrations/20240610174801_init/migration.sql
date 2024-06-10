-- CreateTable
CREATE TABLE "Store" (
    "id" SERIAL NOT NULL,
    "store_name" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL,
    "rule_value" TEXT NOT NULL,
    "average_spend_per_order" DOUBLE PRECISION NOT NULL,
    "firstOrder" INTEGER NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

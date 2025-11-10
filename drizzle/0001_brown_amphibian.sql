CREATE TABLE `balance_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`type` enum('recharge','consume','refund','freeze','unfreeze') NOT NULL,
	`relatedOrderId` int,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `balance_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `balances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`balance` int NOT NULL DEFAULT 0,
	`frozenBalance` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `balances_id` PRIMARY KEY(`id`),
	CONSTRAINT `balances_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`unifiedSocialCreditCode` varchar(18),
	`legalPerson` varchar(100),
	`businessLicense` text,
	`verificationStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`verificationTime` timestamp,
	`rejectReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `computing_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`specs` text,
	`cpuCores` int,
	`memory` int,
	`gpuModel` varchar(100),
	`gpuCount` int,
	`pricePerHour` int NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	`status` enum('available','unavailable') NOT NULL DEFAULT 'available',
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `computing_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderId` int NOT NULL,
	`invoiceType` enum('personal','company') NOT NULL,
	`invoiceTitle` varchar(255) NOT NULL,
	`taxNumber` varchar(20),
	`amount` int NOT NULL,
	`status` enum('pending','processing','completed','rejected') NOT NULL DEFAULT 'pending',
	`invoiceUrl` text,
	`rejectReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNo` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`resourceType` enum('computing','space') NOT NULL,
	`resourceId` int NOT NULL,
	`resourceName` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`duration` int NOT NULL,
	`durationUnit` enum('hour','day','month') NOT NULL,
	`unitPrice` int NOT NULL,
	`totalAmount` int NOT NULL,
	`status` enum('pending','paid','using','completed','cancelled','refunded') NOT NULL DEFAULT 'pending',
	`startTime` timestamp,
	`endTime` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNo_unique` UNIQUE(`orderNo`)
);
--> statement-breakpoint
CREATE TABLE `space_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`location` varchar(255),
	`area` int,
	`capacity` int,
	`facilities` text,
	`pricePerDay` int NOT NULL,
	`pricePerMonth` int,
	`stock` int NOT NULL DEFAULT 0,
	`status` enum('available','unavailable') NOT NULL DEFAULT 'available',
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `space_resources_id` PRIMARY KEY(`id`)
);

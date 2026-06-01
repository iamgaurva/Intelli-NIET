-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: campus_issue_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `complaint_images`
--

DROP TABLE IF EXISTS `complaint_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_images` (
  `image_id` bigint NOT NULL AUTO_INCREMENT,
  `complaint_id` bigint NOT NULL,
  `image_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  KEY `complaint_id` (`complaint_id`),
  CONSTRAINT `complaint_images_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint_images`
--

LOCK TABLES `complaint_images` WRITE;
/*!40000 ALTER TABLE `complaint_images` DISABLE KEYS */;
INSERT INTO `complaint_images` VALUES (1,4,'uploads\\complaints\\f3c75c1d-1013-45f0-a313-90591a701a2b.png','2026-04-03 09:05:35');
/*!40000 ALTER TABLE `complaint_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaint_status_history`
--

DROP TABLE IF EXISTS `complaint_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_status_history` (
  `history_id` bigint NOT NULL AUTO_INCREMENT,
  `complaint_id` bigint NOT NULL,
  `old_status` varchar(255) DEFAULT NULL,
  `new_status` varchar(255) NOT NULL,
  `changed_by` bigint NOT NULL,
  `remarks` text,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `changed_by` (`changed_by`),
  KEY `idx_history_complaint` (`complaint_id`),
  CONSTRAINT `complaint_status_history_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`) ON DELETE CASCADE,
  CONSTRAINT `complaint_status_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint_status_history`
--

LOCK TABLES `complaint_status_history` WRITE;
/*!40000 ALTER TABLE `complaint_status_history` DISABLE KEYS */;
INSERT INTO `complaint_status_history` VALUES (1,3,NULL,'SUBMITTED',1,'Complaint created','2026-04-01 15:18:42'),(2,3,'SUBMITTED','IN_PROGRESS',1,'Assigned for inspection and repair work','2026-04-01 15:38:58'),(3,3,'IN_PROGRESS','RESOLVED',1,'Issue repaired successfully','2026-04-01 15:41:24'),(4,3,'RESOLVED','CLOSED',1,'Checked physically. Issue resolved.','2026-04-01 17:12:31'),(5,3,'CLOSED','REOPENED',1,'Issue still exists.','2026-04-01 17:12:53'),(6,4,NULL,'SUBMITTED',2,'Complaint created','2026-04-01 18:30:31'),(7,4,'SUBMITTED','IN_PROGRESS',1,'Assigned for inspection and repair work','2026-04-01 18:33:09'),(8,4,'IN_PROGRESS','RESOLVED',1,'Issue repaired successfully','2026-04-01 18:33:54'),(9,4,'RESOLVED','CLOSED',2,'Checked physically. Issue resolved.','2026-04-01 18:36:19'),(10,5,NULL,'SUBMITTED',2,'Complaint created','2026-04-03 08:28:43'),(11,5,'SUBMITTED','IN_PROGRESS',1,'Assigned to maintenance team','2026-04-03 08:35:57');
/*!40000 ALTER TABLE `complaint_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaints`
--

DROP TABLE IF EXISTS `complaints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaints` (
  `complaint_id` bigint NOT NULL AUTO_INCREMENT,
  `complaint_title` varchar(200) NOT NULL,
  `complaint_description` text NOT NULL,
  `category_id` bigint NOT NULL,
  `location_id` bigint NOT NULL,
  `reported_by` bigint NOT NULL,
  `priority` enum('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
  `status` enum('SUBMITTED','UNDER_REVIEW','ASSIGNED','IN_PROGRESS','DELAYED','RESOLVED','REOPENED','CLOSED') DEFAULT 'SUBMITTED',
  `assigned_department` varchar(100) DEFAULT NULL,
  `expected_resolution_days` int DEFAULT NULL,
  `expected_resolution_date` date DEFAULT NULL,
  `actual_resolution_date` date DEFAULT NULL,
  `admin_remark` text,
  `is_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `custom_category` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`complaint_id`),
  KEY `category_id` (`category_id`),
  KEY `location_id` (`location_id`),
  KEY `idx_complaints_user` (`reported_by`),
  KEY `idx_complaints_status` (`status`),
  CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `issue_categories` (`category_id`),
  CONSTRAINT `complaints_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `locations` (`location_id`),
  CONSTRAINT `complaints_ibfk_3` FOREIGN KEY (`reported_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaints`
--

LOCK TABLES `complaints` WRITE;
/*!40000 ALTER TABLE `complaints` DISABLE KEYS */;
INSERT INTO `complaints` VALUES (1,'Water leakage in lab','Pipe is leaking near lab entrance',1,1,1,'MEDIUM','SUBMITTED',NULL,NULL,NULL,NULL,NULL,0,'2026-04-01 13:54:10','2026-04-01 13:54:10',NULL),(2,'Water leakage near classroom','There is water leakage near classroom entrance.',1,1,1,'HIGH','SUBMITTED',NULL,NULL,NULL,NULL,NULL,0,'2026-04-01 15:02:24','2026-04-01 15:02:24',NULL),(3,'Water leakage near classroom','There is water leakage near classroom entrance.',1,1,1,'HIGH','REOPENED',NULL,NULL,NULL,'2026-04-01','Issue repaired successfully',0,'2026-04-01 15:18:42','2026-04-01 17:12:53',NULL),(4,'Water leakage near classroom','There is water leakage near classroom entrance.',1,1,2,'HIGH','CLOSED',NULL,NULL,NULL,'2026-04-02','Issue repaired successfully',1,'2026-04-01 18:30:31','2026-04-01 18:36:19',NULL),(5,'Fan not working in classroom','The ceiling fan is not working in Block A room 101.',4,1,2,'HIGH','IN_PROGRESS',NULL,NULL,NULL,NULL,'Assigned to maintenance team',0,'2026-04-03 08:28:43','2026-04-03 08:35:57',NULL);
/*!40000 ALTER TABLE `complaints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delay_logs`
--

DROP TABLE IF EXISTS `delay_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delay_logs` (
  `delay_id` bigint NOT NULL AUTO_INCREMENT,
  `complaint_id` bigint NOT NULL,
  `delayed_by` bigint NOT NULL,
  `old_expected_date` date DEFAULT NULL,
  `new_expected_date` date DEFAULT NULL,
  `reason` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`delay_id`),
  KEY `fk_delay_complaint` (`complaint_id`),
  KEY `fk_delay_user` (`delayed_by`),
  CONSTRAINT `fk_delay_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`),
  CONSTRAINT `fk_delay_user` FOREIGN KEY (`delayed_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delay_logs`
--

LOCK TABLES `delay_logs` WRITE;
/*!40000 ALTER TABLE `delay_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `delay_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department_assignments`
--

DROP TABLE IF EXISTS `department_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department_assignments` (
  `assignment_id` bigint NOT NULL AUTO_INCREMENT,
  `complaint_id` bigint NOT NULL,
  `assigned_department` varchar(100) NOT NULL,
  `assigned_by` bigint NOT NULL,
  `assigned_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expected_days` int DEFAULT NULL,
  `expected_completion_date` date DEFAULT NULL,
  `assignment_status` enum('ACTIVE','COMPLETED','REASSIGNED') DEFAULT 'ACTIVE',
  PRIMARY KEY (`assignment_id`),
  KEY `complaint_id` (`complaint_id`),
  KEY `assigned_by` (`assigned_by`),
  CONSTRAINT `department_assignments_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`) ON DELETE CASCADE,
  CONSTRAINT `department_assignments_ibfk_2` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department_assignments`
--

LOCK TABLES `department_assignments` WRITE;
/*!40000 ALTER TABLE `department_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `department_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `issue_categories`
--

DROP TABLE IF EXISTS `issue_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `issue_categories` (
  `category_id` bigint NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `issue_categories`
--

LOCK TABLES `issue_categories` WRITE;
/*!40000 ALTER TABLE `issue_categories` DISABLE KEYS */;
INSERT INTO `issue_categories` VALUES (1,'Water Leakage',NULL,1,'2026-04-01 13:51:39'),(2,'Electricity',NULL,1,'2026-04-01 13:51:39'),(3,'Garbage',NULL,1,'2026-04-01 13:51:39'),(4,'Furniture',NULL,1,'2026-04-01 13:51:39'),(5,'Washroom',NULL,1,'2026-04-01 13:51:39'),(6,'Internet',NULL,1,'2026-04-01 13:51:39'),(7,'Cleaning',NULL,1,'2026-04-01 13:51:39'),(8,'Classroom Maintenance',NULL,1,'2026-04-01 13:51:39'),(9,'Laboratory Equipment',NULL,1,'2026-04-01 13:51:39'),(10,'Projector/Smart Board',NULL,1,'2026-04-01 13:51:39'),(11,'Air Conditioning',NULL,1,'2026-04-01 13:51:39'),(12,'Security',NULL,1,'2026-04-01 13:51:39'),(13,'Parking',NULL,1,'2026-04-01 13:51:39'),(14,'Network Issue',NULL,1,'2026-04-01 13:51:39'),(15,'Others',NULL,1,'2026-04-01 13:51:39');
/*!40000 ALTER TABLE `issue_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `location_id` bigint NOT NULL AUTO_INCREMENT,
  `block_name` varchar(50) NOT NULL,
  `floor` varchar(20) DEFAULT NULL,
  `room_number` varchar(20) DEFAULT NULL,
  `lab_name` varchar(100) DEFAULT NULL,
  `location_description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,'Block A','1','101',NULL,NULL,'2026-04-01 13:52:44'),(2,'Block B','2','205',NULL,NULL,'2026-04-01 13:52:44'),(3,'Block C','Ground','Lab 1',NULL,NULL,'2026-04-01 13:52:44');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `complaint_id` bigint DEFAULT NULL,
  `notification_title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `notification_type` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `complaint_id` (`complaint_id`),
  KEY `idx_notifications_user` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,5,'New Complaint Raised','A new complaint has been raised by Teacher User','COMPLAINT_CREATED',0,'2026-04-03 08:28:43'),(2,2,5,'Complaint Status Updated','Your complaint status has been updated to IN_PROGRESS','STATUS_UPDATED',0,'2026-04-03 08:35:57'),(3,1,4,'Complaint Image Uploaded','An image has been uploaded for complaint ID 4','IMAGE_UPLOADED',0,'2026-04-03 09:05:36');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','TEACHER') NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin User','admin@niet.co.in','$2a$10$DVVF89sT2vekQCwWealA7eD9oyMUqimYEiMxygaaatzdq21ETfEv.','ADMIN','Administration',NULL,1,'2026-04-01 13:52:56','2026-04-01 18:56:26'),(2,'Teacher User','teacher@niet.co.in','$2a$10$W5QFcTfSQVXzZK6.39JvIeD/vFczUmGk3HqfyNlt4CLi.sbV6IjN2','TEACHER','CSE',NULL,1,'2026-04-01 17:50:04','2026-04-01 18:56:32');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verification_logs`
--

DROP TABLE IF EXISTS `verification_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verification_logs` (
  `verification_id` bigint NOT NULL AUTO_INCREMENT,
  `complaint_id` bigint NOT NULL,
  `verified_by` bigint NOT NULL,
  `verification_status` enum('VERIFIED','REOPENED') NOT NULL,
  `comments` text,
  `verified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`verification_id`),
  KEY `complaint_id` (`complaint_id`),
  KEY `verified_by` (`verified_by`),
  CONSTRAINT `verification_logs_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`) ON DELETE CASCADE,
  CONSTRAINT `verification_logs_ibfk_2` FOREIGN KEY (`verified_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verification_logs`
--

LOCK TABLES `verification_logs` WRITE;
/*!40000 ALTER TABLE `verification_logs` DISABLE KEYS */;
INSERT INTO `verification_logs` VALUES (1,3,1,'VERIFIED','Checked physically. Issue resolved.','2026-04-01 17:12:31'),(2,3,1,'REOPENED','Issue still exists.','2026-04-01 17:12:53'),(3,4,2,'VERIFIED','Checked physically. Issue resolved.','2026-04-01 18:36:19');
/*!40000 ALTER TABLE `verification_logs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-03 14:59:21

CREATE DATABASE  IF NOT EXISTS `seller_bnb` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `seller_bnb`;
-- MySQL dump 10.13  Distrib 5.6.17, for Win32 (x86)
--
-- Host: localhost    Database: seller_bnb
-- ------------------------------------------------------
-- Server version	5.6.20

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `biddings`
--

DROP TABLE IF EXISTS `biddings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `biddings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bid` double DEFAULT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `packageType` varchar(255) DEFAULT NULL,
  `deliveryBy` varchar(255) DEFAULT NULL,
  `paymentTerms` varchar(255) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  `WareHouseId` int(11) DEFAULT NULL,
  `ItemId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  KEY `WareHouseId` (`WareHouseId`),
  KEY `ItemId` (`ItemId`),
  CONSTRAINT `biddings_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `biddings_ibfk_2` FOREIGN KEY (`WareHouseId`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `biddings_ibfk_3` FOREIGN KEY (`ItemId`) REFERENCES `items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `biddings`
--

LOCK TABLES `biddings` WRITE;
/*!40000 ALTER TABLE `biddings` DISABLE KEYS */;
INSERT INTO `biddings` VALUES (1,525,'424','fads','Seller','1 week credit','fdsafd','mutual-cancellation-all','2017-02-07 19:12:13','2017-03-03 05:39:06',1,1,2),(2,354,'24','fdaf','Seller','Cash On Delivery','safdsfsdfaf','accepted','2017-02-08 06:03:04','2017-02-11 23:26:07',1,1,2),(3,45,'5000','','Buyer','1 month credit','','open','2017-02-11 23:08:29','2017-02-11 23:08:29',1,1,3),(4,50,'','','Buyer','1 month credit','','open','2017-02-11 23:10:53','2017-02-28 20:08:15',1,1,3);
/*!40000 ALTER TABLE `biddings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `businesscertificates`
--

DROP TABLE IF EXISTS `businesscertificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `businesscertificates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `number` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `businesscertificates_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `businesscertificates`
--

LOCK TABLES `businesscertificates` WRITE;
/*!40000 ALTER TABLE `businesscertificates` DISABLE KEYS */;
/*!40000 ALTER TABLE `businesscertificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `comment` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `NewsId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `NewsId` (`NewsId`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`NewsId`) REFERENCES `news` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commodities`
--

DROP TABLE IF EXISTS `commodities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commodities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `segment` varchar(255) DEFAULT NULL,
  `family` varchar(255) DEFAULT NULL,
  `class` varchar(255) DEFAULT NULL,
  `measureUnit` varchar(255) DEFAULT NULL,
  `specification` text,
  `hits` int(11) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `CommodityId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `CommodityId` (`CommodityId`),
  CONSTRAINT `commodities_ibfk_1` FOREIGN KEY (`CommodityId`) REFERENCES `tradingcommodities` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commodities`
--

LOCK TABLES `commodities` WRITE;
/*!40000 ALTER TABLE `commodities` DISABLE KEYS */;
INSERT INTO `commodities` VALUES (1,'Test1','Test2','Test3','Test4','Test5','asfdfsfdsfsdfsdaffd',0,'2017-01-28 16:07:48','2017-01-28 16:07:48',NULL),(2,'fsaf','fdsa','fads','fasd','fsgd','saffdsffasffds',0,'2017-01-28 16:10:15','2017-01-28 16:10:15',NULL),(3,'fsdd','fsad','fsad','fasdf','fads','fsdaffasfsd',0,'2017-01-28 16:11:25','2017-01-28 16:11:25',NULL),(4,'fsdd','fsad','fsad','fasdf','fads','fsdaffasfsd',0,'2017-01-28 16:11:44','2017-01-28 16:11:44',NULL),(5,'aaa','vvv','bbb','ccc','vv','fasfdfsafdfsfsdfsf',0,'2017-01-28 16:16:59','2017-01-28 16:16:59',NULL),(6,'sadfd','fdsaffdg','gdfsg','gs','gsdf','fdasfdfsf',0,'2017-01-28 16:20:02','2017-01-28 16:20:02',NULL),(7,'fsadf','fadsf','fasdf','fsadf','fsdaf','fsadfdsfad',0,'2017-01-28 16:23:57','2017-01-28 16:23:57',NULL),(8,'fsadf','fadsf','fasdf','fsadf','fsdaf','fsadfdsfad',0,'2017-01-28 16:24:26','2017-01-28 16:24:26',NULL),(9,'dfads','fsdaf','fasd','fasd','fdsaf','fsadsd',0,'2017-01-28 16:30:26','2017-01-28 16:30:26',NULL),(10,'Test Commodity','TEst','Test','fjsdkla','fjsdlkfj','jflkadsjfjkflsj',0,'2017-01-30 06:01:32','2017-01-30 06:01:32',NULL),(11,'cdaaaa','aaa','aa','aa','aaa','fsdafsda',0,'2017-01-30 06:33:28','2017-01-30 06:33:28',NULL),(12,'cdaaaa','bbb','aa','aa','aaa','fsdafsda',0,'2017-01-30 06:33:28','2017-01-30 06:33:28',NULL),(13,'Ribbed SMoked Sheet 3 Sri Lankan',' Rubber','NaTURAL rUBBER ','Ribbed SMoked Sheet 3','Kg','6544 \n44 564654\n540615065464',0,'2017-02-11 23:36:39','2017-02-11 23:36:39',NULL);
/*!40000 ALTER TABLE `commodities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commodityalternames`
--

DROP TABLE IF EXISTS `commodityalternames`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commodityalternames` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `CommodityId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `CommodityId` (`CommodityId`),
  CONSTRAINT `commodityalternames_ibfk_1` FOREIGN KEY (`CommodityId`) REFERENCES `commodities` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commodityalternames`
--

LOCK TABLES `commodityalternames` WRITE;
/*!40000 ALTER TABLE `commodityalternames` DISABLE KEYS */;
INSERT INTO `commodityalternames` VALUES (1,'kkk','2017-01-28 16:16:59','2017-01-28 16:16:59',5),(2,'vfgg','2017-01-28 16:16:59','2017-01-28 16:16:59',5),(3,'gsgs','2017-01-28 16:16:59','2017-01-28 16:16:59',5),(4,'gds','2017-01-28 16:20:02','2017-01-28 16:20:02',6),(5,'gdsg','2017-01-28 16:20:02','2017-01-28 16:20:02',6),(6,'gsdf','2017-01-28 16:20:02','2017-01-28 16:20:02',6),(7,'vvv','2017-01-28 16:23:57','2017-01-28 16:23:57',7),(8,'vvv','2017-01-28 16:24:26','2017-01-28 16:24:26',8),(9,'fdsaf','2017-01-28 16:30:26','2017-01-28 16:30:26',9),(10,'jfaksl','2017-01-30 06:01:32','2017-01-30 06:01:32',10),(11,'jfklsdja','2017-01-30 06:01:32','2017-01-30 06:01:32',10),(12,'aaf','2017-01-30 06:33:28','2017-01-30 06:33:28',11),(13,'fdsafsf','2017-01-30 06:33:28','2017-01-30 06:33:28',11),(14,'Rss 3 Sri Lankan','2017-02-11 23:36:39','2017-02-11 23:36:39',13);
/*!40000 ALTER TABLE `commodityalternames` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commodityimages`
--

DROP TABLE IF EXISTS `commodityimages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commodityimages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `CommodityId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `CommodityId` (`CommodityId`),
  CONSTRAINT `commodityimages_ibfk_1` FOREIGN KEY (`CommodityId`) REFERENCES `commodities` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commodityimages`
--

LOCK TABLES `commodityimages` WRITE;
/*!40000 ALTER TABLE `commodityimages` DISABLE KEYS */;
INSERT INTO `commodityimages` VALUES (1,'icon-disaster-relief.png','2017-01-28 16:07:48','2017-01-28 16:07:48',NULL),(2,'FuelAotearoa_Logo.jpg','2017-01-28 16:07:48','2017-01-28 16:07:48',NULL),(3,'logo-aerodynamic-bus-black-tourist-luxury-coach-39030284.jpg','2017-01-28 16:16:59','2017-01-28 16:16:59',5),(4,'db_credentials.png','2017-01-28 16:20:02','2017-01-28 16:20:02',6),(5,'Screenshot_2016-03-14-08-03-01.png','2017-01-30 06:01:32','2017-01-30 06:01:32',10),(6,'Google-GO.jpg','2017-01-30 06:33:28','2017-01-30 06:33:28',11),(7,'Screenshot_2016-03-14-08-03-01.png','2017-01-30 06:33:28','2017-01-30 06:33:28',11),(8,'Is-Google-Searching-for-the-Next-Big-Thing1.jpg','2017-02-11 23:36:39','2017-02-11 23:36:39',13);
/*!40000 ALTER TABLE `commodityimages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commodityparameters`
--

DROP TABLE IF EXISTS `commodityparameters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commodityparameters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `value` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `CommodityId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `CommodityId` (`CommodityId`),
  CONSTRAINT `commodityparameters_ibfk_1` FOREIGN KEY (`CommodityId`) REFERENCES `commodities` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commodityparameters`
--

LOCK TABLES `commodityparameters` WRITE;
/*!40000 ALTER TABLE `commodityparameters` DISABLE KEYS */;
INSERT INTO `commodityparameters` VALUES (1,'fasdf','fsadfs','2017-01-28 16:11:44','2017-01-28 16:11:44',4),(2,'fasdf','fsadf','2017-01-28 16:11:44','2017-01-28 16:11:44',4),(3,'tttt','yyyy','2017-01-28 16:16:59','2017-01-28 16:16:59',5),(4,'fasdf','fasdf','2017-01-28 16:20:02','2017-01-28 16:20:02',6),(5,'fsaf','fdsaf','2017-01-28 16:20:02','2017-01-28 16:20:02',6),(6,'fdasf','fasdf','2017-01-28 16:23:57','2017-01-28 16:23:57',7),(7,'fdasf','fasdf','2017-01-28 16:24:26','2017-01-28 16:24:26',8),(8,'asfsd','jfdsklafjdsk','2017-01-30 06:01:32','2017-01-30 06:01:32',10),(9,'fsdaf','fasdf','2017-01-30 06:33:28','2017-01-30 06:33:28',11),(10,'fsdfasfd','fasdfdsa','2017-02-11 23:36:39','2017-02-11 23:36:39',13),(11,'fsdafsad','fadsfsdaf','2017-02-11 23:36:39','2017-02-11 23:36:39',13);
/*!40000 ALTER TABLE `commodityparameters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emails`
--

DROP TABLE IF EXISTS `emails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `emails` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `emails_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emails`
--

LOCK TABLES `emails` WRITE;
/*!40000 ALTER TABLE `emails` DISABLE KEYS */;
INSERT INTO `emails` VALUES (1,'kjtdimuthu@gmail.com','2017-01-24 00:00:00','2017-01-24 00:00:00',1);
/*!40000 ALTER TABLE `emails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itemcomments`
--

DROP TABLE IF EXISTS `itemcomments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `itemcomments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `comment` text,
  `rate` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ItemId` int(11) DEFAULT NULL,
  `UserId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ItemId` (`ItemId`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `itemcomments_ibfk_1` FOREIGN KEY (`ItemId`) REFERENCES `items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `itemcomments_ibfk_2` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itemcomments`
--

LOCK TABLES `itemcomments` WRITE;
/*!40000 ALTER TABLE `itemcomments` DISABLE KEYS */;
INSERT INTO `itemcomments` VALUES (1,'fsdaf',4,'2017-02-08 05:04:56','2017-02-08 05:04:56',2,1),(2,'Ammatahudu!',3,'2017-02-08 05:42:22','2017-02-08 05:42:22',2,1),(3,'safdsfasddsfazsd',4,'2017-02-11 23:11:28','2017-02-11 23:11:28',3,1);
/*!40000 ALTER TABLE `itemcomments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itemimages`
--

DROP TABLE IF EXISTS `itemimages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `itemimages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ItemId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ItemId` (`ItemId`),
  CONSTRAINT `itemimages_ibfk_1` FOREIGN KEY (`ItemId`) REFERENCES `items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itemimages`
--

LOCK TABLES `itemimages` WRITE;
/*!40000 ALTER TABLE `itemimages` DISABLE KEYS */;
INSERT INTO `itemimages` VALUES (2,'FuelAotearoa_Logo.jpg','2017-01-30 18:43:24','2017-01-30 18:43:24',2),(3,'GPE2_500.jpg','2017-01-31 17:48:45','2017-01-31 17:48:45',2),(4,'icon-disaster-relief.png','2017-02-11 23:23:26','2017-02-11 23:23:26',6),(5,'Untitled-2.jpg','2017-02-11 23:23:26','2017-02-11 23:23:26',6);
/*!40000 ALTER TABLE `itemimages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `packageType` varchar(255) DEFAULT NULL,
  `deliveryBy` varchar(255) DEFAULT NULL,
  `deliveryCost` varchar(255) DEFAULT NULL,
  `paymentTerms` varchar(255) DEFAULT NULL,
  `suggestedPrice` double DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `hits` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  `CommodityId` int(11) DEFAULT NULL,
  `WareHouseId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  KEY `CommodityId` (`CommodityId`),
  KEY `WareHouseId` (`WareHouseId`),
  CONSTRAINT `items_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `items_ibfk_2` FOREIGN KEY (`CommodityId`) REFERENCES `commodities` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `items_ibfk_3` FOREIGN KEY (`WareHouseId`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (1,'AFFD','fsadf',NULL,'Buyer',NULL,'1 month credit',23,'fdsaf','mutual-cancellation-buyer',180120,NULL,'2017-02-20 18:33:02','2017-03-02 16:01:26',1,11,1),(2,'Test Title','fasdf','fsadf','Buyer',NULL,'1 month credit',23.33,'fdsfas',NULL,1994520,189,'2017-02-20 18:35:36','2017-03-02 21:17:26',1,11,1),(3,'Test Title2','fsadf','fads','Buyer',NULL,'1 month credit',230,'sdfadf',NULL,2070120,17,'2017-02-20 18:39:37','2017-03-02 14:04:20',1,12,1),(4,'vxcx','fdsa','fds','Buyer',NULL,'Cash On Delivery',34,'sfsad',NULL,180120,NULL,'2017-02-20 18:43:24','2017-01-30 18:43:24',1,11,1),(5,'fsda','fffff','fsd','Buyer',NULL,'1 week credit',23.9,'fsdafsdsdf','stopbidding',93600,NULL,'2017-02-20 17:48:45','2017-02-09 15:33:55',1,11,1),(6,'Ribbed SMoked Sheet 3 Sri Lankan ','5000','50 KG BALE','Buyer',NULL,'1 month credit',500,'Good Quality //',NULL,86400,NULL,'2017-02-20 23:23:26','2017-02-11 23:23:26',1,11,1);
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `news` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `content` text,
  `hits` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `news_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES (7,'Test News Commodities','Stop Bidding','<p><img src=\"http://www.tpt.com/resources/images/content_images/main_grains.jpg\" alt=\"\" width=\"860\" height=\"405\" />Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of \"de Finibus Bonorum et Malorum\" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, \"Lorem ipsum dolor sit amet..\", comes from a line in section 1.10.32.</p>\r <p>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from \"de Finibus Bonorum et Malorum\" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p>',8,'2017-01-19 05:47:50','2017-01-20 14:43:47',1),(8,'Test News Commodities 2','Delete','<p><img src=\"http://economiasemsegredos.com/wp-content/uploads/2015/06/fdsfsdfsdsf.png\" width=\"860\" height=\"405\" />Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sed molestie libero. Cras ac nisl nibh. Proin posuere massa quis est vehicula, id blandit nisl tristique. Suspendisse nulla enim, egestas non est non, scelerisque bibendum leo. Quisque risus massa, dapibus id lectus accumsan, sollicitudin egestas eros. In vehicula nunc pellentesque blandit aliquam. Aliquam ultricies ipsum id dolor volutpat, vel feugiat dui vehicula. Nulla eleifend augue at condimentum semper. Mauris vehicula eget nisl at fermentum. Mauris ac diam vitae mauris consequat porttitor sed eget lorem. Ut elementum quis urna eu feugiat. In hac habitasse platea dictumst. Cras convallis purus purus, non fringilla massa congue eget. Suspendisse non varius felis, vulputate faucibus tellus. Sed aliquam pretium nulla.</p>\r <p>Donec et libero quis lorem gravida vehicula. Donec sagittis lobortis mattis. Vestibulum lacus tellus, aliquam quis velit luctus, mattis fermentum dolor. Nunc sed leo non metus gravida ultrices sed a mi. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Maecenas sodales posuere tellus, in vehicula magna bibendum sed. Sed auctor viverra malesuada.</p>\r <p>Donec luctus, nunc vitae laoreet pellentesque, massa nulla tristique metus, id varius ante elit id nisl. Mauris consectetur eleifend vehicula. In neque nulla, imperdiet venenatis ullamcorper eget, auctor at ligula. Mauris rutrum lacus sed diam euismod tempor. Aliquam eget dui rutrum, vestibulum dui quis, viverra nisi. Donec sit amet est eu nisl lacinia tempus. Suspendisse pellentesque vulputate purus sed sollicitudin. Aliquam erat volutpat. Mauris condimentum varius lacus, non aliquam augue rutrum porta. Nullam tempor, ante efficitur imperdiet porttitor, lectus erat suscipit risus, vel venenatis nisl mi eu nulla. In pulvinar pharetra lectus, ut dignissim justo sodales sit amet. Phasellus eget auctor lorem. Vestibulum dignissim feugiat arcu quis aliquet. Maecenas scelerisque, urna eget interdum venenatis, diam massa sollicitudin orci, a blandit est magna ac ligula. Sed turpis sem, iaculis quis interdum a, venenatis tempus risus.</p>',4,'2017-01-19 07:21:37','2017-01-20 16:42:54',1),(9,'Test News Commodities 3','Hold','<p><img src=\"https://g.foolcdn.com/editorial/images/210360/best-commodity-etfs_large.jpg\" alt=\"\" width=\"609\" height=\"405\" />Nam eu libero sed ipsum lobortis mollis. Integer sed ultrices nunc. Etiam volutpat est nec tempor volutpat. Aenean sit amet ex tempor, tempor risus quis, finibus nisi. Aliquam imperdiet nisi orci, eget vehicula velit mollis a. Praesent rutrum scelerisque dapibus. Curabitur non molestie sapien. Curabitur aliquam elit eu tortor feugiat vulputate. Fusce scelerisque vulputate risus.</p>\r\n<p>Fusce rutrum est eget augue dapibus, vitae finibus justo euismod. Duis commodo purus a orci accumsan pellentesque sit amet vitae odio. Integer tempus sem nisi, sed viverra eros mollis nec. Nam tempor eget odio ac mollis. Sed mollis lacus ac turpis pretium placerat. Aliquam vitae nibh neque. Phasellus pulvinar molestie rhoncus. Quisque vel ante magna. Integer dictum purus sit amet tortor ultricies, at pellentesque urna dapibus. Morbi et mauris sit amet felis vehicula malesuada. Proin sed mollis turpis. Suspendisse varius est ut lobortis ullamcorper.</p>',7,'2017-01-19 07:44:02','2017-01-20 14:48:42',1),(10,'Test News Commodities 4','Delete','<p><img src=\"https://research.rabobank.com/far/en/images/ACMR-1920.jpg\" width=\"860\" height=\"458\" />Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed molestie mi in placerat euismod. Donec non orci justo. Pellentesque et nibh ac est gravida porta. Donec ut magna laoreet, iaculis nisi at, lacinia nibh. Aliquam erat volutpat. Vivamus sed felis fermentum, venenatis elit et, tristique elit. Ut quis tortor id libero pharetra ornare. Fusce nisi neque, malesuada at egestas eu, pharetra eget justo. Vestibulum eu neque libero. Integer et ornare tortor, venenatis consectetur neque. Nulla porta tortor tortor. Nullam gravida semper viverra.</p>\r\n<p>Vivamus sodales volutpat ullamcorper. Phasellus ut volutpat lorem. Etiam ullamcorper vulputate ligula, vitae efficitur est laoreet at. Suspendisse quis nunc quis risus faucibus scelerisque. Sed tempor nisl ut quam faucibus, eget suscipit lectus dictum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec faucibus at augue at posuere. Integer ex leo, blandit sodales diam ut, ultrices dapibus odio. Donec ultricies ipsum non diam semper, eu vulputate mauris suscipit.</p>',2,'2017-01-19 07:47:50','2017-01-20 14:50:20',1),(11,'asfdsfasfsa','Stop Bidding','<p>fsdafsdfdsafsadfsafdssdfnvasaslfnsasdlfasdfsad&nbsp;</p>',0,'2017-02-11 23:29:05','2017-02-11 23:29:05',1);
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(255) DEFAULT NULL,
  `description` text,
  `url` text,
  `seen` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (9,'mutual-cancellation-seller','Mutual Cancellation Request for item Test Title','/user/buy/contract/id/2',1,'2017-03-02 22:14:04','2017-03-03 05:39:03',1),(27,'mutual-cancellation-buyer','Mutual Cancellation Request for item Test Title','/user/sell/contract/bidId/2',0,'2017-03-03 05:39:06','2017-03-03 05:39:06',1);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paymentinformations`
--

DROP TABLE IF EXISTS `paymentinformations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `paymentinformations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bankAccountNo` varchar(255) DEFAULT NULL,
  `accountType` varchar(255) DEFAULT NULL,
  `accountName` varchar(255) DEFAULT NULL,
  `bankName` varchar(255) DEFAULT NULL,
  `bankCountry` varchar(255) DEFAULT NULL,
  `bankCBranch` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `paymentinformations_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paymentinformations`
--

LOCK TABLES `paymentinformations` WRITE;
/*!40000 ALTER TABLE `paymentinformations` DISABLE KEYS */;
/*!40000 ALTER TABLE `paymentinformations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phonenumbers`
--

DROP TABLE IF EXISTS `phonenumbers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `phonenumbers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `number` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `phonenumbers_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phonenumbers`
--

LOCK TABLES `phonenumbers` WRITE;
/*!40000 ALTER TABLE `phonenumbers` DISABLE KEYS */;
INSERT INTO `phonenumbers` VALUES (1,'+94712924287','2017-03-02 22:14:04','2017-03-02 22:14:04',1);
/*!40000 ALTER TABLE `phonenumbers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tradingcommodities`
--

DROP TABLE IF EXISTS `tradingcommodities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tradingcommodities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `buyOrSell` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `tradingcommodities_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tradingcommodities`
--

LOCK TABLES `tradingcommodities` WRITE;
/*!40000 ALTER TABLE `tradingcommodities` DISABLE KEYS */;
/*!40000 ALTER TABLE `tradingcommodities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `companyIntroduction` text,
  `mailingddress1` varchar(255) DEFAULT NULL,
  `mailingddress2` varchar(255) DEFAULT NULL,
  `mailingCity` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'kjtdimuthu@gmail.commm','$2a$10$J457TJfYXS1T6es1XXWit.gOP/XWzKsq..abVv.JL/QZMe0LdHttO','Dimuthu LLLL','Sell BNB',NULL,NULL,'University Of Moratuwa','Katubedda','Sri Lanka',NULL,NULL,'2017-01-24 00:00:00','2017-02-11 23:16:45'),(4,'dimuthu@gmail.com','$2a$10$W4wYpmFKFqRSedsjG0ja0uDg1urs/rns6i.ZVG6UqgmgLJcwzpjHe',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2017-02-09 12:14:03','2017-02-09 12:14:03');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouses`
--

DROP TABLE IF EXISTS `warehouses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `warehouses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `warehouseAddress1` varchar(255) DEFAULT NULL,
  `warehouseAddress2` varchar(255) DEFAULT NULL,
  `warehouseCity` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `warehouses_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouses`
--

LOCK TABLES `warehouses` WRITE;
/*!40000 ALTER TABLE `warehouses` DISABLE KEYS */;
INSERT INTO `warehouses` VALUES (1,'Gothatuwa Watta','Baddegama',NULL,'2017-01-30 00:00:00','2017-01-30 00:00:00',1);
/*!40000 ALTER TABLE `warehouses` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-03-03 17:18:51

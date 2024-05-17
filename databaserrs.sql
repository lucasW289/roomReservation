-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 29, 2024 at 01:15 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `databaserrs`
--

-- --------------------------------------------------------

--
-- Table structure for table `history`
--

CREATE TABLE `history` (
  `HistoryID` int(11) UNSIGNED NOT NULL,
  `BookingID` int(11) NOT NULL,
  `RoomID` int(11) NOT NULL,
  `BookingDate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `TimeSlot` varchar(60) NOT NULL,
  `UserID` smallint(6) NOT NULL,
  `ApproverID` smallint(6) NOT NULL,
  `Actions` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `history`
--

INSERT INTO `history` (`HistoryID`, `BookingID`, `RoomID`, `BookingDate`, `TimeSlot`, `UserID`, `ApproverID`, `Actions`) VALUES
(1, 1, 1, '2024-04-24 09:31:04', '8-10', 3, 5, 'Approved'),
(2, 9, 2, '2024-04-24 02:55:55', '15-17', 11, 5, 'Approved'),
(3, 2, 1, '2024-04-24 03:08:03', '10-12', 1, 5, 'Rejected'),
(4, 5, 1, '2024-04-25 05:56:23', '15-17', 1, 5, 'Rejected'),
(5, 8, 2, '2024-04-25 08:43:00', '13-15', 1, 5, 'Rejected'),
(6, 36, 9, '2024-04-26 22:58:33', '13-15', 11, 5, 'Approved'),
(7, 12, 3, '2024-04-27 07:49:00', '15-17', 11, 5, 'Approved'),
(8, 1, 1, '2024-04-28 15:36:44', '8-10', 1, 5, 'Approved'),
(9, 3, 1, '2024-04-28 15:36:46', '13-15', 3, 5, 'Approved'),
(10, 3, 1, '2024-04-28 15:36:48', '13-15', 3, 5, 'Approved'),
(11, 4, 1, '2024-04-28 15:36:49', '15-17', 4, 5, 'Approved'),
(12, 2, 1, '2024-04-28 15:39:06', '10-12', 2, 5, 'Rejected'),
(13, 1, 1, '2024-04-28 16:13:40', '8-10', 1, 5, 'Approved');

-- --------------------------------------------------------

--
-- Table structure for table `roombooking`
--

CREATE TABLE `roombooking` (
  `BookingID` int(11) NOT NULL,
  `RoomID` int(11) NOT NULL,
  `TimeSlot` varchar(60) NOT NULL,
  `Status` varchar(60) NOT NULL,
  `UserID` smallint(6) DEFAULT NULL,
  `ApproverID` smallint(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roombooking`
--

INSERT INTO `roombooking` (`BookingID`, `RoomID`, `TimeSlot`, `Status`, `UserID`, `ApproverID`) VALUES
(1, 1, '8-10', 'Free', NULL, NULL),
(2, 1, '10-12', 'Free', NULL, NULL),
(3, 1, '13-15', 'Free', NULL, NULL),
(4, 1, '15-17', 'Free', NULL, NULL),
(5, 2, '8-10', 'Free', NULL, NULL),
(6, 2, '10-12', 'Free', NULL, NULL),
(7, 2, '13-15', 'Free', NULL, NULL),
(8, 2, '15-17', 'Free', NULL, NULL),
(9, 3, '8-10', 'Free', NULL, NULL),
(10, 3, '10-12', 'Free', NULL, NULL),
(11, 3, '13-15', 'Free', NULL, NULL),
(12, 3, '15-17', 'Free', NULL, NULL),
(13, 4, '8-10', 'Free', NULL, NULL),
(14, 4, '10-12', 'Free', NULL, NULL),
(15, 4, '13-15', 'Free', NULL, NULL),
(16, 4, '15-17', 'Free', NULL, NULL),
(17, 5, '8-10', 'Free', NULL, NULL),
(18, 5, '10-12', 'Free', NULL, NULL),
(19, 5, '13-15', 'Free', NULL, NULL),
(20, 5, '15-17', 'Free', NULL, NULL),
(21, 6, '8-10', 'Free', NULL, NULL),
(22, 6, '10-12', 'Free', NULL, NULL),
(23, 6, '13-15', 'Free', NULL, NULL),
(24, 6, '15-17', 'Free', NULL, NULL),
(25, 7, '8-10', 'Free', NULL, NULL),
(26, 7, '10-12', 'Free', NULL, NULL),
(27, 7, '13-15', 'Free', NULL, NULL),
(28, 7, '15-17', 'Free', NULL, NULL),
(29, 8, '8-10', 'Free', NULL, NULL),
(30, 8, '10-12', 'Free', NULL, NULL),
(31, 8, '13-15', 'Free', NULL, NULL),
(32, 8, '15-17', 'Free', NULL, NULL),
(33, 9, '8-10', 'Free', NULL, NULL),
(34, 9, '10-12', 'Free', NULL, NULL),
(35, 9, '13-15', 'Free', NULL, NULL),
(36, 9, '15-17', 'Free', NULL, NULL),
(37, 10, '8-10', 'Free', NULL, NULL),
(38, 10, '10-12', 'Free', NULL, NULL),
(39, 10, '13-15', 'Free', NULL, NULL),
(40, 10, '15-17', 'Free', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `RoomID` int(11) NOT NULL,
  `RoomNumber` varchar(60) NOT NULL,
  `RoomSize` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`RoomID`, `RoomNumber`, `RoomSize`) VALUES
(1, 'LR-101', 'Large'),
(2, 'LR-102', 'Large'),
(3, 'LR-103', 'Large'),
(4, 'MR-101', 'Medium'),
(5, 'MR-102', 'Medium'),
(6, 'MR-103', 'Medium'),
(7, 'SR-101', 'Small'),
(8, 'SR-102', 'Small'),
(9, 'SR-103', 'Small'),
(10, 'TR-101', 'Small');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `UserID` smallint(6) NOT NULL,
  `Username` varchar(60) NOT NULL,
  `Name` varchar(60) NOT NULL,
  `Email` varchar(60) NOT NULL,
  `Password` varchar(60) NOT NULL,
  `RoleID` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`UserID`, `Username`, `Name`, `Email`, `Password`, `RoleID`) VALUES
(1, 'John', 'John Smith', 'johnsmith@gmail.com', '$2b$10$Wvc4OeCm6TBtuz.fkose6eociE1i9n4gtdIZEgEYexsWZMrQKkqRm', 1),
(2, 'Nathan', 'Nathan Anderson', 'nathan@gmail.com', '$2b$10$Wvc4OeCm6TBtuz.fkose6eociE1i9n4gtdIZEgEYexsWZMrQKkqRm', 1),
(3, 'Jon', 'Jon Snow', 'jonsnow@gmail.com', '$2b$10$Wvc4OeCm6TBtuz.fkose6eociE1i9n4gtdIZEgEYexsWZMrQKkqRm', 1),
(4, 'Jesse', 'Jesse Pinkman', 'jessepinkman@gmail.com', '$2b$10$Wvc4OeCm6TBtuz.fkose6eociE1i9n4gtdIZEgEYexsWZMrQKkqRm', 1),
(5, 'Alex', 'Alex White', 'Alexwhite@gmail.com', '$2b$10$qfc43YRra/fvTRltvL2US.LMqOoFKaVk1SQmyTMp/ZZZayPm.zsay', 2),
(6, 'Walt', 'Walter White', 'walterwhite@gmail.com', '$2b$10$qfc43YRra/fvTRltvL2US.LMqOoFKaVk1SQmyTMp/ZZZayPm.zsay', 2),
(7, 'Elena', 'Elena Castillo', 'elena@gmail.com', '$2b$10$tS8XzoFwtgOaNKdqBy9evukHNFZfbPokvwrSKQI6OPmFahdCaTAQG', 3),
(8, 'a', 'a', 'a@gmail.com', '$2b$10$fizB3W5CG08yIIGJL1D57uq.p4iKWej6SeIkKiOYbtYkOUbucoR3y', 1),
(9, 'b', 'b', 'b@gmail.com', '$2b$10$T9No1H2Ct4B7BJhGwPRxEOg8c3H.BWXJjC7KosABq9VtHLDUkfIiK', 1),
(10, 'c', 'c', 'c@gmail.com', '$2b$10$JRq0yfNRvaWBkNwzIwMDx.WPu.C4fXps/ZyOYFT8R76EIWnxj/co6', 1),
(11, 'd_username', 'd', 'd@gmail.com', '$2b$10$39gjeov1WhztrSzeQRxNpuqRsxkg/12KgO0sWXF7XofjEhCboAykm', 1),
(12, 'e_username', 'e', 'e@gmail.com', '$2b$10$xLjXFHsx346tQV/oBMtWQeu/kUHNKLAMeA0iA7qjdbLgf1u7yFQuG', 1),
(13, 'x_username', 'x', 'x@gmail.com', '$2b$10$mM4RD4HcD1cZtbCCiRaJveRGdm0JoKpRglmjQ1rHKR05IfFMWKADW', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`HistoryID`);

--
-- Indexes for table `roombooking`
--
ALTER TABLE `roombooking`
  ADD PRIMARY KEY (`BookingID`),
  ADD KEY `RoomID` (`RoomID`),
  ADD KEY `fk_roombooking_userID` (`UserID`),
  ADD KEY `fk_roombooking_approverID` (`ApproverID`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`RoomID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `history`
--
ALTER TABLE `history`
  MODIFY `HistoryID` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `roombooking`
--
ALTER TABLE `roombooking`
  MODIFY `BookingID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `RoomID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `UserID` smallint(6) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `roombooking`
--
ALTER TABLE `roombooking`
  ADD CONSTRAINT `fk_roombooking_approverID` FOREIGN KEY (`ApproverID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `fk_roombooking_userID` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `roombooking_ibfk_1` FOREIGN KEY (`RoomID`) REFERENCES `rooms` (`RoomID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

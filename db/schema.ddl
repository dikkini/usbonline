SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = ON;
SET check_function_bodies = FALSE;
SET client_min_messages = WARNING;
SET search_path = BOOTLINE;
SET default_tablespace = '';
SET default_with_oids = FALSE;

CREATE SCHEMA IF NOT EXISTS BOOTLINE AUTHORIZATION winusb;

CREATE TABLE BOOTLINE.USERBROWSERINFO
(
  sessionid VARCHAR(255) PRIMARY KEY,
  startdate VARCHAR(255),
  enddate VARCHAR(255),
  appcodename VARCHAR(255),
  appname VARCHAR(255),
  appversion VARCHAR(255),
  language VARCHAR(255),
  platform VARCHAR(255),
  useragent VARCHAR(255),
  javaenabled BOOLEAN,
  cookiesenabled BOOLEAN,
  browserversion VARCHAR(255)
);

CREATE TABLE BOOTLINE.SOCIALCATEGORY
(
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE BOOTLINE.SOCIALTOPIC
(
  feedback TEXT NOT NULL,
  email VARCHAR(255) NOT NULL,
  categoryid INT REFERENCES SOCIALCATEGORY(id),
  portable BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE "BOOTLINE".SOCIALTOPICCOMMENT
(
  name VARCHAR(100) NOT NULL,
  comment TEXT NOT NULL
);
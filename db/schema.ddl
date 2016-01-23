SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = ON;
SET check_function_bodies = FALSE;
SET client_min_messages = WARNING;
SET search_path = BOOTLINE;
SET default_tablespace = '';
SET default_with_oids = FALSE;

CREATE SCHEMA IF NOT EXISTS BOOTLINE AUTHORIZATION winusb;

CREATE TABLE BOOTLINE.F_USERBROWSERINFO
(
  sessionId      VARCHAR(255),
  appcodename    VARCHAR(255),
  appname        VARCHAR(255),
  appversion     VARCHAR(255),
  language       VARCHAR(255),
  platform       VARCHAR(255),
  useragent      VARCHAR(255),
  javaenabled    BOOLEAN,
  cookiesenabled BOOLEAN,
  browserversion VARCHAR(255),
  createddate TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE BOOTLINE.D_SOCIALCATEGORY
(
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE BOOTLINE.F_SOCIALTOPIC
(
  id         SERIAL PRIMARY KEY,
  sessionId  VARCHAR(255) NOT NULL,
  subject    VARCHAR(255) NOT NULL,
  text       VARCHAR(255) NOT NULL,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  categoryid INT REFERENCES D_SOCIALCATEGORY(id),
  portable   BOOLEAN DEFAULT FALSE NOT NULL,
  reviewed   BOOLEAN DEFAULT FALSE NOT NULL,
  createddate TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE BOOTLINE.F_SOCIALTOPICCOMMENT
(
  id      SERIAL PRIMARY KEY,
  topicid INT REFERENCES F_SOCIALTOPIC(id),
  name    VARCHAR(100) NOT NULL,
  comment TEXT NOT NULL,
  createddate TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE BOOTLINE.F_STATISTIC
(
  countusers INT NOT NULL,
  activeusers INT NOT NULL,
  pressedstartapp INT NOT NULL,
  pressedstartapp_chrome INT NOT NULL,
  downloadportable INT NOT NULL
);

CREATE TABLE BOOTLINE.F_LOG
(
  sessionId  VARCHAR(255) NOT NULL,
  time TIMESTAMP NOT NULL,
  timeoffset VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(255) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA bootline
TO winusb;
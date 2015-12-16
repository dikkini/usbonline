SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = ON;
SET check_function_bodies = FALSE;
SET client_min_messages = WARNING;
SET search_path = BOOTLINE;
SET default_tablespace = '';
SET default_with_oids = FALSE;

CREATE SCHEMA IF NOT EXISTS BOOTLINE AUTHORIZATION winusb;

CREATE TABLE BOOTLINE.F_USERSESSION
(
  sessionId VARCHAR(255) NOT NULL PRIMARY KEY,
  createddate DATE NOT NULL
);

CREATE TABLE BOOTLINE.F_USERBROWSERINFO
(
  sessionId      VARCHAR(255) REFERENCES F_USERSESSION(sessionId),
  appcodename    VARCHAR(255),
  appname        VARCHAR(255),
  appversion     VARCHAR(255),
  language       VARCHAR(255),
  platform       VARCHAR(255),
  useragent      VARCHAR(255),
  javaenabled    BOOLEAN,
  cookiesenabled BOOLEAN,
  browserversion VARCHAR(255),
  createddate DATE NOT NULL
);

CREATE TABLE BOOTLINE.D_SOCIALCATEGORY
(
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT FALSE NOT NULL
);

INSERT INTO "BOOTLINE".D_SOCIALCATEGORY (id, name, description, active) VALUES (0, 'Bugs', 'Bugs Descr', true);
INSERT INTO "BOOTLINE".D_SOCIALCATEGORY (id, name, description, active) VALUES (1, 'Advice', 'Advice Descr', true);
INSERT INTO "BOOTLINE".D_SOCIALCATEGORY (id, name, description, active) VALUES (2, 'Gratitude', 'Gratitude Descr', true);
INSERT INTO "BOOTLINE".D_SOCIALCATEGORY (id, name, description, active) VALUES (3, 'Other', 'Other Descr', false);

CREATE TABLE BOOTLINE.F_SOCIALTOPIC
(
  id         SERIAL PRIMARY KEY,
  sessionId  VARCHAR(255) REFERENCES F_USERSESSION(sessionId),
  subject    VARCHAR(255) NOT NULL,
  text       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  categoryid INT REFERENCES D_SOCIALCATEGORY(id),
  portable   BOOLEAN DEFAULT FALSE NOT NULL,
  reviewed   BOOLEAN DEFAULT FALSE NOT NULL,
  createddate DATE NOT NULL
);

CREATE TABLE BOOTLINE.F_SOCIALTOPICCOMMENT
(
  id      SERIAL PRIMARY KEY,
  topicid INT REFERENCES F_SOCIALTOPIC(id),
  name    VARCHAR(100) NOT NULL,
  comment TEXT NOT NULL,
  createddate DATE NOT NULL
);
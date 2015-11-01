SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = ON;
SET check_function_bodies = FALSE;
SET client_min_messages = WARNING;
SET search_path = PUBLIC, pg_catalog;
SET default_tablespace = '';
SET default_with_oids = FALSE;

DROP TABLE public.userinfo CASCADE;

CREATE TABLE userinfo
(
  sessionId VARCHAR(255),
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
  browserversion VARCHAR(255),
  feedback_email VARCHAR(255),
  feedback TEXT
);
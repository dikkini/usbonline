SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = ON;
SET check_function_bodies = FALSE;
SET client_min_messages = WARNING;
SET search_path = PUBLIC, pg_catalog;
SET default_tablespace = '';
SET default_with_oids = FALSE;

DROP TABLE public.users CASCADE;
DROP TABLE public.sessionLog CASCADE;
DROP TABLE public.sessions CASCADE;

CREATE TABLE users
(
  userid VARCHAR(36) PRIMARY KEY NOT NULL,
  premium BOOL DEFAULT FALSE NOT NULL,
  restore_premium_request BOOL DEFAULT FALSE NOT NULL
);
CREATE UNIQUE INDEX unique_userid ON users (userid);

CREATE TABLE sessionLog
(
  id INT PRIMARY KEY,
  log TEXT
);

CREATE TABLE sessions
(
  id TEXT PRIMARY KEY NOT NULL,
  userTimeStart TIMESTAMP,
  userTimeEnd TIMESTAMP,
  log_id INT REFERENCES public.sessionLog(id)
);

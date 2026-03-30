--
-- PostgreSQL database dump
--

\restrict pHdx4MmqNXEOucS7OkSbstRZMcjRjsm5om53nyKkxBcKZcswGnnh96J3jf73k7t

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: project_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.project_role AS ENUM (
    'supervisor',
    'opponent'
);


ALTER TYPE public.project_role OWNER TO postgres;

--
-- Name: status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status AS ENUM (
    'draft',
    'locked',
    'public'
);


ALTER TYPE public.status OWNER TO postgres;

--
-- Name: user_roles; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_roles AS ENUM (
    'admin',
    'teacher',
    'student'
);


ALTER TYPE public.user_roles OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    user_id uuid NOT NULL,
    action_type character varying(50) NOT NULL,
    description character varying(255) NOT NULL,
    metadata jsonb,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activity_logs_id_seq OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attachments (
    id bigint NOT NULL,
    project_id bigint,
    filename character varying NOT NULL,
    storage_path character varying NOT NULL,
    description character varying,
    uploaded_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL
);


ALTER TABLE public.attachments OWNER TO postgres;

--
-- Name: attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.attachments_id_seq OWNER TO postgres;

--
-- Name: attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attachments_id_seq OWNED BY public.attachments.id;


--
-- Name: external_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_links (
    id bigint NOT NULL,
    project_id bigint,
    url character varying,
    title character varying,
    description character varying,
    added_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL
);


ALTER TABLE public.external_links OWNER TO postgres;

--
-- Name: external_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.external_links_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.external_links_id_seq OWNER TO postgres;

--
-- Name: external_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.external_links_id_seq OWNED BY public.external_links.id;


--
-- Name: grades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grades (
    id bigint NOT NULL,
    value bigint NOT NULL,
    year_id bigint NOT NULL,
    project_id bigint NOT NULL,
    reviewer_id uuid NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    scale_id bigint
);


ALTER TABLE public.grades OWNER TO postgres;

--
-- Name: grades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grades_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.grades_id_seq OWNER TO postgres;

--
-- Name: grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grades_id_seq OWNED BY public.grades.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message character varying(500) NOT NULL,
    read boolean DEFAULT false NOT NULL,
    metadata jsonb,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: project_descriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_descriptions (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    topic text,
    project_goal text,
    specification text,
    schedule jsonb,
    needed_output text[],
    grading_criteria text[],
    grading_notes text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.project_descriptions OWNER TO postgres;

--
-- Name: project_descriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_descriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_descriptions_id_seq OWNER TO postgres;

--
-- Name: project_descriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_descriptions_id_seq OWNED BY public.project_descriptions.id;


--
-- Name: project_signups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_signups (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    student_id uuid NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.project_signups OWNER TO postgres;

--
-- Name: project_signups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_signups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_signups_id_seq OWNER TO postgres;

--
-- Name: project_signups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_signups_id_seq OWNED BY public.project_signups.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id bigint NOT NULL,
    title character varying NOT NULL,
    supervisor_id uuid,
    opponent_id uuid,
    subject character varying NOT NULL,
    description character varying,
    main_documentation character varying,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    student_id uuid,
    status public.status DEFAULT 'draft'::public.status,
    year_id bigint,
    subject_id bigint,
    lock_reason character varying(255),
    locked_at timestamp(6) with time zone,
    locked_by uuid,
    reminders_sent integer[] DEFAULT ARRAY[]::integer[]
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: COLUMN projects.reminders_sent; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.projects.reminders_sent IS 'List of reminder days that have been sent for this project (e.g., [7, 3] means 7-day and 3-day reminders were sent)';


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projects_id_seq OWNER TO postgres;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    reviewer_id uuid NOT NULL,
    comments character varying NOT NULL,
    submitted_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reviews_id_seq OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: scale_set_scales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scale_set_scales (
    id bigint NOT NULL,
    scale_set_id bigint NOT NULL,
    scale_id bigint NOT NULL,
    weight smallint NOT NULL,
    display_order smallint,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.scale_set_scales OWNER TO postgres;

--
-- Name: scale_set_scales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.scale_set_scales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.scale_set_scales_id_seq OWNER TO postgres;

--
-- Name: scale_set_scales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.scale_set_scales_id_seq OWNED BY public.scale_set_scales.id;


--
-- Name: scale_sets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scale_sets (
    id bigint NOT NULL,
    name character varying,
    year_id bigint,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    project_role public.project_role
);


ALTER TABLE public.scale_sets OWNER TO postgres;

--
-- Name: scale_sets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.scale_sets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.scale_sets_id_seq OWNER TO postgres;

--
-- Name: scale_sets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.scale_sets_id_seq OWNED BY public.scale_sets.id;


--
-- Name: scales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scales (
    id bigint NOT NULL,
    "maxVal" bigint NOT NULL,
    name text NOT NULL,
    "desc" text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.scales OWNER TO postgres;

--
-- Name: scales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.scales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.scales_id_seq OWNER TO postgres;

--
-- Name: scales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.scales_id_seq OWNED BY public.scales.id;


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects (
    id bigint NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    name character varying(255) NOT NULL
);


ALTER TABLE public.subjects OWNER TO postgres;

--
-- Name: subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subjects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subjects_id_seq OWNER TO postgres;

--
-- Name: subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subjects_id_seq OWNED BY public.subjects.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    role public.user_roles NOT NULL,
    first_name character varying,
    last_name character varying,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    email character varying NOT NULL,
    year_id bigint,
    avatar_url character varying,
    password_hash character varying DEFAULT ''::character varying NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    email_verified_at timestamp(6) with time zone,
    password_reset_token character varying,
    password_reset_expires timestamp(6) with time zone,
    last_login timestamp(6) with time zone,
    class character varying(10),
    auth_provider character varying(20) DEFAULT 'local'::character varying NOT NULL,
    microsoft_id character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: years; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.years (
    id bigint NOT NULL,
    school_id bigint,
    assignment_date timestamp(6) with time zone,
    submission_date timestamp(6) with time zone,
    feedback_date timestamp(6) with time zone,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name character varying(50),
    deadline_reminder_days integer[] DEFAULT ARRAY[7, 3, 1]
);


ALTER TABLE public.years OWNER TO postgres;

--
-- Name: COLUMN years.deadline_reminder_days; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.years.deadline_reminder_days IS 'Days before submission_date to send deadline reminders (configurable in admin panel)';


--
-- Name: years_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.years_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.years_id_seq OWNER TO postgres;

--
-- Name: years_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.years_id_seq OWNED BY public.years.id;


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments ALTER COLUMN id SET DEFAULT nextval('public.attachments_id_seq'::regclass);


--
-- Name: external_links id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_links ALTER COLUMN id SET DEFAULT nextval('public.external_links_id_seq'::regclass);


--
-- Name: grades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades ALTER COLUMN id SET DEFAULT nextval('public.grades_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: project_descriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_descriptions ALTER COLUMN id SET DEFAULT nextval('public.project_descriptions_id_seq'::regclass);


--
-- Name: project_signups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_signups ALTER COLUMN id SET DEFAULT nextval('public.project_signups_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: scale_set_scales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scale_set_scales ALTER COLUMN id SET DEFAULT nextval('public.scale_set_scales_id_seq'::regclass);


--
-- Name: scale_sets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scale_sets ALTER COLUMN id SET DEFAULT nextval('public.scale_sets_id_seq'::regclass);


--
-- Name: scales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scales ALTER COLUMN id SET DEFAULT nextval('public.scales_id_seq'::regclass);


--
-- Name: subjects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects ALTER COLUMN id SET DEFAULT nextval('public.subjects_id_seq'::regclass);


--
-- Name: years id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.years ALTER COLUMN id SET DEFAULT nextval('public.years_id_seq'::regclass);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: external_links external_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_links
    ADD CONSTRAINT external_links_pkey PRIMARY KEY (id);


--
-- Name: grades grade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grade_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: project_descriptions project_descriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_descriptions
    ADD CONSTRAINT project_descriptions_pkey PRIMARY KEY (id);


--
-- Name: project_signups project_signups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_signups
    ADD CONSTRAINT project_signups_pkey PRIMARY KEY (id);


--
-- Name: project_signups project_signups_project_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_signups
    ADD CONSTRAINT project_signups_project_id_student_id_key UNIQUE (project_id, student_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: scales scale_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scales
    ADD CONSTRAINT scale_pkey PRIMARY KEY (id);


--
-- Name: scale_sets scale_set_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scale_sets
    ADD CONSTRAINT scale_set_pkey PRIMARY KEY (id);


--
-- Name: scale_set_scales scale_set_scales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scale_set_scales
    ADD CONSTRAINT scale_set_scales_pkey PRIMARY KEY (id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: years year_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.years
    ADD CONSTRAINT year_pkey PRIMARY KEY (id);


--
-- Name: activity_logs_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_logs_created_at_idx ON public.activity_logs USING btree (created_at);


--
-- Name: activity_logs_project_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_logs_project_id_idx ON public.activity_logs USING btree (project_id);


--
-- Name: attachments_project_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX attachments_project_id_idx ON public.attachments USING btree (project_id);


--
-- Name: external_links_project_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX external_links_project_id_idx ON public.external_links USING btree (project_id);


--
-- Name: grades_scale_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX grades_scale_id_idx ON public.grades USING btree (scale_id);


--
-- Name: idx_grades_reviewer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grades_reviewer ON public.grades USING btree (reviewer_id);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at);


--
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_read ON public.notifications USING btree (read);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_project_descriptions_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_project_descriptions_project_id ON public.project_descriptions USING btree (project_id);


--
-- Name: idx_project_descriptions_schedule; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_project_descriptions_schedule ON public.project_descriptions USING gin (schedule);


--
-- Name: idx_project_signups_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_project_signups_project_id ON public.project_signups USING btree (project_id);


--
-- Name: idx_project_signups_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_project_signups_student_id ON public.project_signups USING btree (student_id);


--
-- Name: idx_projects_locked_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_locked_by ON public.projects USING btree (locked_by);


--
-- Name: idx_projects_opponent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_opponent ON public.projects USING btree (opponent_id);


--
-- Name: idx_projects_reminders_sent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_reminders_sent ON public.projects USING gin (reminders_sent);


--
-- Name: idx_projects_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_status ON public.projects USING btree (status);


--
-- Name: idx_projects_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_student ON public.projects USING btree (student_id);


--
-- Name: idx_projects_subject_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_subject_id ON public.projects USING btree (subject_id);


--
-- Name: idx_projects_supervisor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_supervisor ON public.projects USING btree (supervisor_id);


--
-- Name: idx_projects_title_trgm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_title_trgm ON public.projects USING gin (title public.gin_trgm_ops);


--
-- Name: idx_projects_year_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_year_id ON public.projects USING btree (year_id);


--
-- Name: idx_reviews_reviewer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_reviewer ON public.reviews USING btree (reviewer_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_email_verified; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email_verified ON public.users USING btree (email_verified);


--
-- Name: idx_users_microsoft_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_microsoft_id ON public.users USING btree (microsoft_id);


--
-- Name: idx_users_password_reset_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_password_reset_token ON public.users USING btree (password_reset_token);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_year_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_year_id ON public.users USING btree (year_id);


--
-- Name: project_descriptions_project_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX project_descriptions_project_id_key ON public.project_descriptions USING btree (project_id);


--
-- Name: project_signups_project_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX project_signups_project_id_idx ON public.project_signups USING btree (project_id);


--
-- Name: project_signups_student_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX project_signups_student_id_idx ON public.project_signups USING btree (student_id);


--
-- Name: reviews_project_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reviews_project_id_idx ON public.reviews USING btree (project_id);


--
-- Name: subjects_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX subjects_name_key ON public.subjects USING btree (name);


--
-- Name: unique_year_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_year_name ON public.years USING btree (name);


--
-- Name: users_email_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_unique ON public.users USING btree (email);


--
-- Name: activity_logs activity_logs_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: attachments attachments_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: external_links external_links_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_links
    ADD CONSTRAINT external_links_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: grades fk_grades_reviewer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT fk_grades_reviewer FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: CONSTRAINT fk_grades_reviewer ON grades; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT fk_grades_reviewer ON public.grades IS 'Reviewer reference - cascade delete grades if reviewer is deleted';


--
-- Name: project_descriptions fk_project_descriptions_project; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_descriptions
    ADD CONSTRAINT fk_project_descriptions_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: projects fk_projects_locked_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_projects_locked_by FOREIGN KEY (locked_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: projects fk_projects_opponent; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_projects_opponent FOREIGN KEY (opponent_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: CONSTRAINT fk_projects_opponent ON projects; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT fk_projects_opponent ON public.projects IS 'Opponent reference - set to NULL if user is deleted';


--
-- Name: projects fk_projects_student; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_projects_student FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: projects fk_projects_supervisor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_projects_supervisor FOREIGN KEY (supervisor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: CONSTRAINT fk_projects_supervisor ON projects; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT fk_projects_supervisor ON public.projects IS 'Supervisor reference - set to NULL if user is deleted';


--
-- Name: projects fk_projects_year; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_projects_year FOREIGN KEY (year_id) REFERENCES public.years(id) ON DELETE SET NULL;


--
-- Name: reviews fk_reviews_reviewer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users fk_users_year; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_year FOREIGN KEY (year_id) REFERENCES public.years(id) ON DELETE SET NULL;


--
-- Name: grades grade_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grade_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: grades grade_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grade_year_id_fkey FOREIGN KEY (year_id) REFERENCES public.years(id);


--
-- Name: grades grades_scale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_scale_id_fkey FOREIGN KEY (scale_id) REFERENCES public.scales(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_signups project_signups_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_signups
    ADD CONSTRAINT project_signups_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_signups project_signups_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_signups
    ADD CONSTRAINT project_signups_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: reviews reviews_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: scale_set_scales scale_set_scales_scale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scale_set_scales
    ADD CONSTRAINT scale_set_scales_scale_id_fkey FOREIGN KEY (scale_id) REFERENCES public.scales(id);


--
-- Name: scale_set_scales scale_set_scales_scale_set_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scale_set_scales
    ADD CONSTRAINT scale_set_scales_scale_set_id_fkey FOREIGN KEY (scale_set_id) REFERENCES public.scale_sets(id);


--
-- Name: scale_sets scale_set_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scale_sets
    ADD CONSTRAINT scale_set_year_id_fkey FOREIGN KEY (year_id) REFERENCES public.years(id);


--
-- PostgreSQL database dump complete
--

\unrestrict pHdx4MmqNXEOucS7OkSbstRZMcjRjsm5om53nyKkxBcKZcswGnnh96J3jf73k7t


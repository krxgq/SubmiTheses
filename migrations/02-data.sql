--
-- PostgreSQL database dump
--

\restrict PsqjnLk3WpMopIZi2nMwkmW0bwffwvWE7MHs7fxBaWr8aHz2aSXmQ4yg2tghQB3

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subjects (id, name_cs, name_en, description, is_active, created_at, updated_at) FROM stdin;
1	Informatika	Computer Science	Obor zaměřený na teoretické a praktické aspekty výpočetní techniky	t	2025-12-06 18:45:52.064118+00	2025-12-06 18:45:52.064118+00
2	Informační technologie	Information Technology	Aplikace počítačových systémů pro správu informací	t	2025-12-06 18:45:52.064118+00	2025-12-06 18:45:52.064118+00
3	Softwarové inženýrství	Software Engineering	Metodologie a praktiky vývoje softwaru	t	2025-12-06 18:45:52.064118+00	2025-12-06 18:45:52.064118+00
4	Matematika	Mathematics	Formální vědy o struktuře, množství a změně	t	2025-12-06 18:45:52.064118+00	2025-12-06 18:45:52.064118+00
5	Kybernetická bezpečnost	Cybersecurity	Ochrana počítačových systémů před útoky	t	2025-12-06 18:45:52.064118+00	2025-12-06 18:45:52.064118+00
6	Umělá inteligence	Artificial Intelligence	Vývoj inteligentních systémů a strojového učení	t	2025-12-06 18:45:52.064118+00	2025-12-06 18:45:52.064118+00
7	Datová věda	Data Science	Analýza a interpretace komplexních dat	t	2025-12-06 18:45:52.064118+00	2025-12-06 18:45:52.064118+00
8	Information Systems	Information Systems	Automaticky vytvořeno z existujících dat	t	2025-12-06 18:46:16.585982+00	2025-12-06 18:46:16.585982+00
9	Electrical Engineering	Electrical Engineering	Automaticky vytvořeno z existujících dat	t	2025-12-06 18:46:16.585982+00	2025-12-06 18:46:16.585982+00
10	Mechanical Engineering	Mechanical Engineering	Automaticky vytvořeno z existujících dat	t	2025-12-06 18:46:16.585982+00	2025-12-06 18:46:16.585982+00
\.


--
-- Data for Name: years; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.years (id, school_id, assignment_date, submission_date, feedback_date, created_at, name) FROM stdin;
1	\N	2024-09-01 00:00:00+00	2025-05-31 23:59:59+00	2025-06-30 23:59:59+00	2025-11-09 23:01:56.782895+00	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, role, full_name, created_at, updated_at, email, year_id, avatar_url) FROM stdin;
e598a4e1-23eb-4856-bdf6-f12cffd9dff2	student	\N	2025-11-10 17:08:06.504206+00	2025-11-10 17:08:06.504206+00	teacher.placeholder@example.com	\N	\N
c0d97268-4efa-4a90-b35a-17f1d88caac3	student	Test Student	2025-11-01 23:30:18.39871+00	2025-11-26 06:14:51.974793+00	testacc@gmail.com	\N	\N
f4c0f416-26e9-4db3-bf04-189610a35027	teacher	Bodnarchuk Bohdan	2025-11-01 23:30:18.39871+00	2025-12-02 05:56:47.733488+00	krogdeveloper@gmail.com	\N	\N
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, title, supervisor_id, opponent_id, subject, description, main_documentation, updated_at, student_id, status, year_id, subject_id) FROM stdin;
5	Augmented Reality Educational Platform	e598a4e1-23eb-4856-bdf6-f12cffd9dff2	e598a4e1-23eb-4856-bdf6-f12cffd9dff2	Computer Science	AR-based educational platform for interactive learning in STEM subjects with gamification elements. Designed for middle and high school students.	https://github.com/example/ar-edu	2025-11-09 23:01:56.782895+00	\N	draft	\N	1
6	Predictive Maintenance System for Manufacturing	e598a4e1-23eb-4856-bdf6-f12cffd9dff2	e598a4e1-23eb-4856-bdf6-f12cffd9dff2	Mechanical Engineering	Machine learning system that predicts equipment failures before they occur using sensor data and historical maintenance records.	\N	2025-11-09 23:01:56.782895+00	\N	draft	\N	10
7	dasda	f4c0f416-26e9-4db3-bf04-189610a35027	\N		\N	\N	2025-12-07 14:56:22.823+00	\N	draft	1	7
8	Test	f4c0f416-26e9-4db3-bf04-189610a35027	\N		\N	\N	2025-12-07 22:23:54.793+00	\N	draft	1	9
1	AI-Powered Code Review System	f4c0f416-26e9-4db3-bf04-189610a35027	e598a4e1-23eb-4856-bdf6-f12cffd9dff2	Computer Science	Development of an AI-powered system for automated code review and quality assessment using machine learning algorithms. The system analyzes code quality, identifies potential bugs, and suggests improvements.	https://github.com/example/code-review-ai	2025-11-09 23:01:56.782895+00	c0d97268-4efa-4a90-b35a-17f1d88caac3	draft	\N	1
2	Blockchain-Based Supply Chain Management	e598a4e1-23eb-4856-bdf6-f12cffd9dff2	f4c0f416-26e9-4db3-bf04-189610a35027	Information Systems	Design and implementation of a blockchain-based supply chain tracking system for pharmaceutical products. Ensures transparency and traceability throughout the supply chain.	\N	2025-11-09 23:01:56.782895+00	c0d97268-4efa-4a90-b35a-17f1d88caac3	draft	\N	8
3	Smart Home Energy Optimization	e598a4e1-23eb-4856-bdf6-f12cffd9dff2	e598a4e1-23eb-4856-bdf6-f12cffd9dff2	Electrical Engineering	IoT-based system for optimizing energy consumption in smart homes using predictive analytics and machine learning. Reduces energy costs by up to 30%.	https://drive.google.com/example/smart-home	2025-11-09 23:01:56.782895+00	c0d97268-4efa-4a90-b35a-17f1d88caac3	draft	\N	9
4	Natural Language Processing for Legal Documents	e598a4e1-23eb-4856-bdf6-f12cffd9dff2	e598a4e1-23eb-4856-bdf6-f12cffd9dff2	Computer Science	NLP system for automated analysis and classification of legal documents with entity recognition and summarization. Processes contracts, court decisions, and legal briefs.	\N	2025-11-09 23:01:56.782895+00	\N	draft	\N	1
9	SJhfil	f4c0f416-26e9-4db3-bf04-189610a35027	\N		\N	\N	2025-12-09 06:16:29.924+00	\N	draft	1	1
\.


--
-- Data for Name: attachments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attachments (id, project_id, filename, storage_path, description, uploaded_at, updated_at) FROM stdin;
1	1	Share.png	/home/krxg/Desktop/SumbiTheses/backend/uploads/Share-1763923450826-319566877.png	\N	2025-11-23 18:44:11.696+00	2025-11-23 18:44:10.83+00
2	1	Share.png	/home/krxg/Desktop/SumbiTheses/backend/uploads/Share-1763923476171-756269856.png	\N	2025-11-23 18:44:36.174+00	2025-11-23 18:44:36.173+00
3	1	EUROPASS_EN_BodnarchukBohdan.docx	/home/krxg/Desktop/SumbiTheses/storage/EUROPASS_EN_BodnarchukBohdan-1763930295380-179938044.docx	\N	2025-11-23 20:38:16.218+00	2025-11-23 20:38:15.384+00
4	1	EUROPASS_EN_BodnarchukBohdan.docx	/home/krxg/Desktop/SumbiTheses/storage/EUROPASS_EN_BodnarchukBohdan-1763930304211-578538836.docx	\N	2025-11-23 20:38:24.213+00	2025-11-23 20:38:24.212+00
\.


--
-- Data for Name: external_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.external_links (id, project_id, url, title, description, added_at, updated_at) FROM stdin;
1	1	https://github.com/example/code-review-ai	GitHub Repository	Main project repository with source code	2025-11-09 23:02:13.527956+00	2025-11-09 23:02:13.527956+00
2	1	https://docs.example.com/code-review	Project Documentation	Technical documentation and API reference	2025-11-09 23:02:13.527956+00	2025-11-09 23:02:13.527956+00
3	1	https://arxiv.org/example	Research Paper	Published research on ML-based code review	2025-11-09 23:02:13.527956+00	2025-11-09 23:02:13.527956+00
4	2	https://ethereum.org/	Ethereum Platform	Blockchain platform used for implementation	2025-11-09 23:02:13.527956+00	2025-11-09 23:02:13.527956+00
5	2	https://trufflesuite.com/	Truffle Framework	Smart contract development framework	2025-11-09 23:02:13.527956+00	2025-11-09 23:02:13.527956+00
6	3	https://example.com/smart-home-demo	Live Demo	Working prototype demonstration	2025-11-09 23:02:13.527956+00	2025-11-09 23:02:13.527956+00
7	3	https://www.tensorflow.org/	TensorFlow	ML framework for energy predictions	2025-11-09 23:02:13.527956+00	2025-11-09 23:02:13.527956+00
8	4	https://spacy.io/	spaCy NLP	NLP library used for text processing	2025-11-09 23:02:13.527956+00	2025-11-09 23:02:13.527956+00
9	5	https://unity.com/	Unity Engine	AR development platform	2025-11-09 23:02:13.527956+00	2025-11-09 23:02:13.527956+00
10	5	https://vuforia.com/	Vuforia	AR SDK for marker tracking	2025-11-09 23:02:13.527956+00	2025-11-09 23:02:13.527956+00
11	6	https://scikit-learn.org/	Scikit-learn	Machine learning library for predictions	2025-11-09 23:02:13.527956+00	2025-11-09 23:02:13.527956+00
\.


--
-- Data for Name: scales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.scales (id, "maxVal", name, "desc", created_at) FROM stdin;
1	100	Implementation Quality	Quality of code, architecture, and technical implementation	2025-11-09 23:03:11.136809+00
2	100	Research & Analysis	Depth of research, literature review, and problem analysis	2025-11-09 23:03:11.136809+00
3	100	Innovation	Originality and innovative aspects of the solution	2025-11-09 23:03:11.136809+00
4	100	Documentation	Quality and completeness of documentation	2025-11-09 23:03:11.136809+00
5	100	Presentation	Quality of thesis defense and presentation skills	2025-11-09 23:03:11.136809+00
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.grades (id, value, year_id, project_id, reviewer_id, created_at, scale_id) FROM stdin;
1	85	1	1	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	1
2	90	1	1	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	2
3	88	1	1	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	3
4	82	1	1	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	4
5	87	1	1	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	5
6	92	1	2	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	1
7	88	1	2	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	2
8	85	1	2	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	3
9	79	1	2	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	4
10	91	1	2	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	5
11	87	1	3	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	1
12	91	1	3	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	2
13	93	1	3	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	3
14	84	1	3	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	4
15	89	1	3	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	5
16	88	1	4	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	1
17	86	1	4	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	2
18	84	1	4	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	3
19	81	1	4	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	4
20	90	1	4	f4c0f416-26e9-4db3-bf04-189610a35027	2025-11-09 23:03:26.917305+00	5
\.


--
-- Data for Name: project_descriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_descriptions (id, project_id, topic, project_goal, specification, schedule, needed_output, grading_criteria, grading_notes, created_at, updated_at) FROM stdin;
1	7	dad	dfaddadfadsffasfdsa	<p>fdsadfsadf</p><ul><li><p>fdfd</p></li></ul><p>fdasd</p><p></p>	[{"month": "Leden", "tasks": "gfsdgsdgs"}]	{rfefds}	{}	\N	2025-12-07 14:56:22.823+00	2025-12-07 14:56:22.823+00
2	8	Electricity	jfdaljfa;fj;aljfal;jf;laj\nfadas	*goal 11*\n\n**TEST**\n\n~~\n\n> ~~111~~\n\n~~	[{"month": "Leden", "tasks": "finish"}]	{vdsv}	{}	\N	2025-12-07 22:23:54.793+00	2025-12-07 22:23:54.793+00
3	9	kuygkug	 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus sodales condimentum nisl eget venenatis. Donec suscipit congue finibus. Sed ornare interdum varius. Nam in enim rhoncus massa placerat rhoncus. Maecenas sit amet dolor auctor, luctus felis at, molestie dui. Integer id elit nulla. Aenean condimentum lectus nisl, et commodo nulla dictum vel. Sed mattis sem mi, in ultricies lorem fringilla a. Ut consequat arcu quis metus rutrum commodo. Proin erat arcu, rutrum in mi at, cursus pretium dui. Pellentesque ac urna sed magna dignissim aliquet a vel tortor. Sed in ornare metus. Praesent porttitor tellus tortor, at dictum dolor condimentum et.\n\nDuis malesuada augue nec leo ultricies fermentum ac ac sapien. Maecenas vel augue sed lectus pulvinar aliquam ut in quam. Fusce mattis, mi eget aliquet tempor, magna nisi faucibus nisi, eu aliquam metus arcu lacinia lacus. Duis ullamcorper vitae est et ullamcorper. Proin efficitur risus eget mattis facilisis. Nunc vitae rutrum purus. Morbi sodales suscipit eros a vehicula. Curabitur porttitor semper libero, eu vestibulum nisi lobortis a. Aliquam at dictum justo. Donec ac orci facilisis, sagittis augue at, luctus ipsum. Fusce diam odio, tristique vitae dictum nec, gravida vel dui. Suspendisse ornare dolor sed arcu aliquam euismod. Pellentesque tellus orci, pellentesque ac lobortis at, scelerisque ut erat. Suspendisse et justo maximus, scelerisque dolor at, auctor dolor.\n\nDonec accumsan id erat sed vulputate. Donec imperdiet sollicitudin orci a venenatis. Etiam eget vehicula lorem. Nunc dictum tincidunt dui ut consequat. Sed sed iaculis risus, ac tempor sem. Pellentesque vitae vulputate libero. Nullam sodales bibendum egestas. Vestibulum ac ultrices lacus, ac sollicitudin nisi. Praesent porttitor sit amet magna ac dictum. Pellentesque vulputate pulvinar malesuada. Integer nec turpis consectetur dolor lacinia lacinia eu a purus. Phasellus tincidunt tristique erat, vel cursus eros ornare in.\n\nPhasellus vel ex odio. Interdum et malesuada fames ac ante ipsum primis in faucibus. In aliquam faucibus tortor vitae convallis. Aliquam erat volutpat. Fusce condimentum ligula at mi efficitur, in sollicitudin erat efficitur. Vivamus sit amet blandit libero, id vestibulum mi. Pellentesque sed elit sed ante ullamcorper aliquam. Vestibulum ac eros ultrices, sagittis lacus vitae, egestas est.\n\nVestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Nulla imperdiet est ipsum, non tempor nibh faucibus sit amet. Fusce ac ullamcorper arcu, eget tempus velit. Ut blandit, purus at scelerisque ullamcorper, est tellus accumsan velit, iaculis tristique orci diam in orci. Aenean volutpat turpis ac faucibus consectetur. Ut ante felis, congue non tincidunt sit amet, vulputate vitae dui. Integer at pellentesque purus. Nulla libero lacus, feugiat eget ultrices id, tempor vel odio. Aenean sollicitudin urna vitae gravida 	 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus sodales condimentum nisl eget venenatis. Donec suscipit congue finibus. Sed ornare interdum varius. Nam in enim rhoncus massa placerat rhoncus. Maecenas sit amet dolor auctor, luctus felis at, molestie dui. Integer id elit nulla. Aenean condimentum lectus nisl, et commodo nulla dictum vel. Sed mattis sem mi, in ultricies lorem fringilla a. Ut consequat arcu quis metus rutrum commodo. Proin erat arcu, rutrum in mi at, cursus pretium dui. Pellentesque ac urna sed magna dignissim aliquet a vel tortor. Sed in ornare metus. Praesent porttitor tellus tortor, at dictum dolor condimentum et.\n\nDuis malesuada augue nec leo ultricies fermentum ac ac sapien. Maecenas vel augue sed lectus pulvinar aliquam ut in quam. Fusce mattis, mi eget aliquet tempor, magna nisi faucibus nisi, eu aliquam metus arcu lacinia lacus. Duis ullamcorper vitae est et ullamcorper. Proin efficitur risus eget mattis facilisis. Nunc vitae rutrum purus. Morbi sodales suscipit eros a vehicula. Curabitur porttitor semper libero, eu vestibulum nisi lobortis a. Aliquam at dictum justo. Donec ac orci facilisis, sagittis augue at, luctus ipsum. Fusce diam odio, tristique vitae dictum nec, gravida vel dui. Suspendisse ornare dolor sed arcu aliquam euismod. Pellentesque tellus orci, pellentesque ac lobortis at, scelerisque ut erat. Suspendisse et justo maximus, scelerisque dolor at, auctor dolor.\n\nDonec accumsan id erat sed vulputate. Donec imperdiet sollicitudin orci a venenatis. Etiam eget vehicula lorem. Nunc dictum tincidunt dui ut consequat. Sed sed iaculis risus, ac tempor sem. Pellentesque vitae vulputate libero. Nullam sodales bibendum egestas. Vestibulum ac ultrices lacus, ac sollicitudin nisi. Praesent porttitor sit amet magna ac dictum. Pellentesque vulputate pulvinar malesuada. Integer nec turpis consectetur dolor lacinia lacinia eu a purus. Phasellus tincidunt tristique erat, vel cursus eros ornare in.\n\n*Phasellus vel ex odio. Interdum et malesuada fames ac ante ipsum primis in faucibus. In aliquam faucibus tortor vitae convallis. Aliquam erat volutpat. Fusce condimentum ligula at mi efficitur, in sollicitudin erat efficitur. Vivamus sit amet blandit libero, id vestibulum mi. Pellentesque sed elit sed ante ullamcorper aliquam. Vestibulum ac eros ultrices, sagittis lacus vitae, egestas est.\n*\nVestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Nulla imperdiet est ipsum, non tempor nibh faucibus sit amet. Fusce ac ullamcorper arcu, eget tempus velit. Ut blandit, purus at scelerisque ullamcorper, est tellus accumsan velit, iaculis tristique orci diam in orci. Aenean volutpat turpis ac faucibus consectetur. Ut ante felis, congue non tincidunt sit amet, vulputate vitae dui. Integer at pellentesque purus. Nulla libero lacus, feugiat eget ultrices id, tempor vel odio. Aenean sollicitudin urna vitae gravida 	[{"month": "Leden", "tasks": "fdssfs"}, {"month": "Srpen", "tasks": "jhujb"}]	{fdsfs,fdsfs}	{}	\N	2025-12-09 06:16:29.924+00	2025-12-09 06:16:29.924+00
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, project_id, reviewer_id, comments, submitted_at, updated_at) FROM stdin;
5	1	f4c0f416-26e9-4db3-bf04-189610a35027	Excellent work on the AI model architecture. The code quality metrics are well-designed and the evaluation methodology is sound. The integration with existing CI/CD pipelines is seamless. Minor improvements needed in the documentation, particularly around edge cases and error handling.	2025-11-07 23:03:11.136809+00	2025-11-09 23:03:11.136809+00
6	2	f4c0f416-26e9-4db3-bf04-189610a35027	Strong implementation of blockchain concepts. The smart contracts are well-written, secure, and follow best practices. Gas optimization is impressive. Consider adding more comprehensive test coverage for edge cases and potential attack vectors. The supply chain visualization dashboard is excellent.	2025-11-08 23:03:11.136809+00	2025-11-09 23:03:11.136809+00
7	3	f4c0f416-26e9-4db3-bf04-189610a35027	Innovative approach to energy optimization. The IoT integration is seamless and the predictive models show promising results with accurate forecasts. Great presentation of findings with clear visualizations. The machine learning model could benefit from additional training data to improve accuracy in extreme weather conditions.	2025-11-06 23:03:11.136809+00	2025-11-09 23:03:11.136809+00
8	4	f4c0f416-26e9-4db3-bf04-189610a35027	Impressive NLP implementation with high accuracy in entity recognition and document classification. The legal domain adaptation is well-executed. Performance optimization is needed for processing large document batches. The user interface for document upload and analysis is intuitive and professional.	2025-11-04 23:03:11.136809+00	2025-11-09 23:03:11.136809+00
\.


--
-- Data for Name: scale_sets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.scale_sets (id, name, year_id, created_at, project_role) FROM stdin;
\.


--
-- Data for Name: scale_set_scales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.scale_set_scales (id, scale_set_id, scale_id, weight, display_order, created_at) FROM stdin;
\.


--
-- Name: attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attachments_id_seq', 4, true);


--
-- Name: external_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.external_links_id_seq', 11, true);


--
-- Name: grade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.grade_id_seq', 20, true);


--
-- Name: project_descriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_descriptions_id_seq', 3, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.projects_id_seq', 9, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_id_seq', 8, true);


--
-- Name: scale_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.scale_id_seq', 1, false);


--
-- Name: scale_set_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.scale_set_id_seq', 1, false);


--
-- Name: scale_set_scales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.scale_set_scales_id_seq', 1, false);


--
-- Name: subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subjects_id_seq', 10, true);


--
-- Name: year_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.year_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict PsqjnLk3WpMopIZi2nMwkmW0bwffwvWE7MHs7fxBaWr8aHz2aSXmQ4yg2tghQB3


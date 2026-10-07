-- CMS pass 3: fixed public Roles, no admin write surface.
-- Additive seed only; reruns never overwrite existing content.
begin;

create table if not exists private.cms_roles (
  id text primary key check (id in ('data', 'core', 'language', 'vision', 'product', 'growth')),
  title text not null check (length(title) between 1 and 20000),
  tagline text not null check (length(tagline) between 1 and 20000),
  chips jsonb not null check (jsonb_typeof(chips) = 'array'),
  deadline text not null check (length(deadline) between 1 and 20000),
  about text not null check (length(about) between 1 and 20000),
  requirements jsonb not null check (jsonb_typeof(requirements) = 'array'),
  contact text not null check (length(contact) between 1 and 20000),
  whatsapp text check (whatsapp ~ '^[0-9]{8,15}$'),
  position smallint not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cms_roles_fixed_position check (position = case id
    when 'data' then 1 when 'core' then 2 when 'language' then 3
    when 'vision' then 4 when 'product' then 5 when 'growth' then 6 end),
  constraint cms_roles_chip_slots check (jsonb_array_length(chips) = case id
    when 'language' then 6 when 'growth' then 3 else 4 end),
  constraint cms_roles_requirement_slots check (jsonb_array_length(requirements) = case id
    when 'core' then 3 when 'growth' then 3 else 4 end),
  constraint cms_roles_chip_text check (not jsonb_path_exists(chips,
    '$[*] ? (@.type() != "string" || @ == "")')),
  constraint cms_roles_requirement_text check (not jsonb_path_exists(requirements,
    '$[*] ? (@.type() != "string" || @ == "")'))
);
alter table private.cms_roles enable row level security;
revoke all on private.cms_roles from public, anon, authenticated;

drop policy if exists cms_roles_deny on private.cms_roles;
create policy cms_roles_deny on private.cms_roles for all
  using (false) with check (false);

create or replace function private.cms_load_roles()
returns jsonb language sql stable security definer
set search_path = pg_catalog
as $$
  select jsonb_build_object('roles', coalesce(jsonb_agg(
    jsonb_strip_nulls(jsonb_build_object(
      'id', id, 'title', title, 'tagline', tagline, 'chips', chips,
      'deadline', deadline, 'about', about, 'requirements', requirements,
      'contact', contact, 'whatsapp', whatsapp
    )) order by position
  ), '[]'::jsonb)) from private.cms_roles;
$$;
revoke all on function private.cms_load_roles() from public, anon, authenticated;

create or replace function public.cms_load_roles()
returns jsonb language sql stable security definer
set search_path = pg_catalog
as $$ select private.cms_load_roles(); $$;
revoke all on function public.cms_load_roles() from public, anon, authenticated;
grant execute on function public.cms_load_roles() to anon, service_role;

insert into private.cms_roles
  (id, title, tagline, chips, deadline, about, requirements, contact, whatsapp, position)
values
  ('data', 'DATA INTELLIGENCE', 'Transforming raw data into meaningful insights and building a solid analytical infrastructure for AI development.', '["Data Science", "Data Analytics", "Data Engineering", "Data Infrastructure"]'::jsonb, 'Deadline: 20 Oktober 2026', 'Data Intelligence focuses on processing, cleaning, and extracting data to generate meaningful insights. This division builds the analytical foundation to support experiments and research based on real-world data.', '["Basic understanding of Python programming or SQL queries.", "Understanding of data cleaning and data visualization concepts.", "Basic knowledge of statistics.", "Experience using Pandas or familiarity with advanced visualization tools."]'::jsonb, 'Zidan Amikul', null, 1),
  ('core', 'CORE AI & ENGINEERING', 'Designing, training, and optimizing Machine Learning algorithms into functional, deploy-ready AI systems.', '["Machine Learning", "Deep Learning", "AI Engineering", "MLOps"]'::jsonb, 'Deadline: 20 Oktober 2026', 'This division designs, trains, and optimizes artificial intelligence models. Core AI & Engineering ensures algorithms can run efficiently from the experimental stage through to deployment.', '["Master programming fundamentals (Python preferred).", "Understand the basic concepts of how Machine Learning algorithms work.", "Plus Point: Experience in model training or deployment, and familiarity with libraries such as Scikit-learn, PyTorch, or TensorFlow."]'::jsonb, 'Zidan Amikul', null, 2),
  ('language', 'LANGUAGE & REASONING', 'Exploring NLP and Generative AI to build systems capable of processing human language and performing complex reasoning.', '["NLP", "Generative AI", "LLM", "RAG", "AI Agents", "Reasoning"]'::jsonb, 'Deadline: 20 Oktober 2026', 'Explores the capabilities of AI in understanding and processing human language. This division focuses on developing text-based systems, integrating generative models, and designing AI agents with reasoning capabilities.', '["Have a basic understanding of NLP or text processing.", "Understand the concepts of LLMs, prompt engineering, embeddings, or RAG.", "Understand how to integrate AI into an application.", "Plus Point: Experience using vector databases or specific experience building AI Agents."]'::jsonb, 'Zidan Amikul', null, 3),
  ('vision', 'VISION & MULTIMODEL', 'Empowering machines with visual capabilities to detect, understand, and process images, video, and multimodal data.', '["Computer Vision", "OCR", "Video Understanding", "Multimodal AI"]'::jsonb, 'Deadline: 20 Oktober 2026', 'Provides visual capabilities to machines. This division experiments with image and video processing, object recognition, and the development of multimodal models that combine image and text analysis.', '["Understand basic image processing and Computer Vision concepts.", "Familiar with Python and OpenCV.", "Understand the concepts of image classification or object detection.", "Plus Point: Experience with YOLO or CNN architectures, as well as knowledge regarding OCR, segmentation, or video processing."]'::jsonb, 'Zidan Amikul', null, 4),
  ('product', 'PRODUCT & SOFTWARE', 'Transforming AI research and experiments into functional, interactive, and user-centric software products.', '["UI/UX", "Front-end", "Back-end", "DevOps"]'::jsonb, 'Deadline: 20 Oktober 2026', 'Transforms AI models and research into functional, user-centric software products. This area covers the entire application development cycle, from interface design to server management.', '["UI/UX: Understand basic UI/UX concepts, familiar with Figma, understand user flows, and have experience creating wireframes/interfaces. \n(Plus Point: Experience in UX research, usability testing, design systems, or interactive prototypes).", "Front-end: Master HTML, CSS, and basic JavaScript fundamentals. (Plus Point: Familiar with React, Next.js, TypeScript, Git, and API integration).", "Back-end: Understand programming fundamentals, API development concepts, and basic database management. \n(Plus Point: Experience with Node.js, Python/FastAPI, REST APIs, Authentication, and PostgreSQL/MySQL).", "DevOps: Understand Git/GitHub, basic Linux commands, and foundational server deployment concepts. \n(Plus Point: Familiar with Docker, CI/CD, Cloud architecture, Kubernetes, or monitoring systems)."]'::jsonb, 'Zidan Amikul', null, 5),
  ('growth', 'GROWTH & COMMUNITY', 'The driving force behind visual communication, partnerships, and expansion strategies to amplify Data Sorcerers'' impact.', '["Public Relations", "Creative", "Community & Partnership"]'::jsonb, 'Deadline: 20 Oktober 2026', 'The driving force behind Data Sorcerers'' reach. This division is responsible for public communication, partnership management, creative campaign design, and maintaining the community ecosystem to ensure continuous growth.', '["Public Relations: Able to communicate effectively, compose communication copy, and understand basic social media management. \n(Plus Point: Experience in media relations, copywriting, and campaign management).", "Creative: Have basic visual/content creation skills using Figma, Illustrator, Photoshop, or video editing tools. \n(Plus Point: Expertise in motion graphics or 3D design, as well as possessing a portfolio of work).", "Community & Partnership: Possess strong networking and teamwork skills, and have the confidence to conduct outreach to external parties. \n(Plus Point: Experience managing partnerships, event collaborations, sponsorships, or stakeholder management)."]'::jsonb, 'Zidan Amikul', null, 6)
on conflict (id) do nothing;

commit;

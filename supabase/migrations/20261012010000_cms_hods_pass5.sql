-- CMS pass 5: fixed public Hods content; no editor, writes, state or Storage.
-- Nested arrays are preserved verbatim; additive seeds preserve existing edits.
begin;

-- Enforce the planned JavaScript UTF-16 ceiling, including astral codepoints.
-- Installed Zod 4 uses codepoint limits, so SQL is stricter for astral text.
create or replace function private.cms_hods_utf16_length(value text)
returns integer language sql immutable strict
set search_path = pg_catalog
as $$
  select coalesce(sum(case when ascii(substr(value, i, 1)) > 65535 then 2 else 1 end), 0)::integer
  from generate_series(1, char_length(value)) as units(i);
$$;
revoke all on function private.cms_hods_utf16_length(text) from public, anon, authenticated;

create or replace function private.cms_hods_tabs_valid(hod_id text, tabs jsonb)
returns boolean language plpgsql immutable
set search_path = pg_catalog
as $$
declare
  mask jsonb;
  tab_value jsonb;
  sections jsonb;
  section_value jsonb;
  bullet_value jsonb;
  expected_keys text[];
  actual_keys text[];
  bullet_count integer;
  t integer;
  s integer;
begin
  mask := case hod_id
    when 'data' then '[[0,4,0],[0,0,0],[0,0,0],[0,0]]'::jsonb
    when 'core' then '[[0,0,0],[0,0,0],[0,0],[0,0,0]]'::jsonb
    when 'language' then '[[0,0],[0,4,0]]'::jsonb
    when 'vision' then '[[0,0,0],[0],[0],[0,0]]'::jsonb
    when 'product' then '[[0,0,0],[0,0,0],[0,0,0],[0,0]]'::jsonb
    when 'growth' then '[[0,0,0],[0,0,0,0],[0,0,0]]'::jsonb
    else null end;
  if mask is null or tabs is null then return false; end if;
  if jsonb_typeof(tabs) <> 'array' then return false; end if;
  if jsonb_array_length(tabs) <> jsonb_array_length(mask) then return false; end if;
  for t in 0..jsonb_array_length(mask)-1 loop
    tab_value := tabs -> t;
    if jsonb_typeof(tab_value) <> 'object' then return false; end if;
    select array_agg(key order by key) into actual_keys from jsonb_object_keys(tab_value) as keys(key);
    if actual_keys is distinct from array['sections']::text[] then return false; end if;
    sections := tab_value -> 'sections';
    if jsonb_typeof(sections) <> 'array' then return false; end if;
    if jsonb_array_length(sections) <> jsonb_array_length(mask -> t) then return false; end if;
    for s in 0..jsonb_array_length(mask -> t)-1 loop
      section_value := sections -> s;
      if jsonb_typeof(section_value) <> 'object' then return false; end if;
      bullet_count := (mask -> t ->> s)::integer;
      expected_keys := case when bullet_count = 0 then array['text','title'] else array['bullets','title'] end;
      select array_agg(key order by key) into actual_keys from jsonb_object_keys(section_value) as keys(key);
      if actual_keys is distinct from expected_keys then return false; end if;
      if jsonb_typeof(section_value -> 'title') <> 'string' then return false; end if;
      if private.cms_hods_utf16_length(section_value ->> 'title') not between 1 and 20000 then return false; end if;
      if bullet_count = 0 then
        if jsonb_typeof(section_value -> 'text') <> 'string' then return false; end if;
        if private.cms_hods_utf16_length(section_value ->> 'text') not between 1 and 20000 then return false; end if;
      else
        if jsonb_typeof(section_value -> 'bullets') <> 'array' then return false; end if;
        if jsonb_array_length(section_value -> 'bullets') <> bullet_count then return false; end if;
        for bullet_value in select value from jsonb_array_elements(section_value -> 'bullets') loop
          if jsonb_typeof(bullet_value) <> 'string' then return false; end if;
          if private.cms_hods_utf16_length(bullet_value #>> '{}') not between 1 and 20000 then return false; end if;
        end loop;
      end if;
    end loop;
  end loop;
  return true;
end;
$$;
revoke all on function private.cms_hods_tabs_valid(text, jsonb) from public, anon, authenticated;

create table if not exists private.cms_hods (
  id text primary key check (id in ('data', 'core', 'language', 'vision', 'product', 'growth')),
  title text not null check (private.cms_hods_utf16_length(title) between 1 and 20000),
  description text not null check (private.cms_hods_utf16_length(description) between 1 and 20000),
  tabs jsonb not null,
  position smallint not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cms_hods_fixed_position check (position = case id
    when 'data' then 1 when 'core' then 2 when 'language' then 3
    when 'vision' then 4 when 'product' then 5 when 'growth' then 6 end),
  constraint cms_hods_tab_slots check (private.cms_hods_tabs_valid(id, tabs) is true)
);
alter table private.cms_hods enable row level security;
revoke all on private.cms_hods from public, anon, authenticated;
drop policy if exists cms_hods_deny on private.cms_hods;
create policy cms_hods_deny on private.cms_hods for all using (false) with check (false);

create or replace function private.cms_load_hods()
returns jsonb language sql stable security definer
set search_path = pg_catalog
as $$
  select jsonb_build_object('hods', coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'title', title, 'description', description, 'tabs', tabs
  ) order by position), '[]'::jsonb)) from private.cms_hods;
$$;
revoke all on function private.cms_load_hods() from public, anon, authenticated;

create or replace function public.cms_load_hods()
returns jsonb language sql stable security definer
set search_path = pg_catalog
as $$ select private.cms_load_hods(); $$;
revoke all on function public.cms_load_hods() from public, anon, authenticated;
grant execute on function public.cms_load_hods() to anon, service_role;

insert into private.cms_hods (id, title, description, tabs, position)
values
  ('data', 'Data Intelligence', 'Transforming data into information, insights, and data systems that can be utilized for decision-making and AI development.', '[{"sections": [{"title": "LEARNING", "text": "Python for Data Science, NumPy, Pandas, Data Cleaning, Exploratory Data Analysis (EDA), Statistical Analysis, Feature Engineering, Machine Learning Fundamentals, Model Evaluation, Data Visualization, Predictive Modeling."}, {"title": "Expected Skills", "bullets": ["Ability to understand and explore datasets.", "Ability to discover patterns and insights.", "Ability to build predictive models.", "Ability to explain analytical results scientifically."]}, {"title": "OUTPUT", "text": "Data analysis, Prediction model, Experiment, Research, Dataset analysis, Dashboard/visualization."}]}, {"sections": [{"title": "LEARNING", "text": "Data Analysis, SQL, Data Visualization, Business Intelligence, Descriptive & Diagnostic Analytics, Dashboard, KPI & Metrics, Data Storytelling, Reporting, Analytical Thinking."}, {"title": "TOOLS", "text": "SQL, Python, Excel/Spreadsheet, Power BI / Tableau, Pandas."}, {"title": "OUTPUT", "text": "Analytical report, Dashboard, Data storytelling, Business insight, Research supporting analysis."}]}, {"sections": [{"title": "LEARNING", "text": "SQL, Database, Data Modeling, ETL / ELT, Data Pipeline, Data Warehouse, Data Lake, API & Data Ingestion, Batch & Streaming Data, Data Processing, Workflow Orchestration."}, {"title": "TOOLS/TECHNOLOGIES", "text": "PostgreSQL / MySQL, Python, Apache Airflow, Spark, Kafka, Cloud data services."}, {"title": "OUTPUT", "text": "Data pipeline, Data warehouse, ETL system, Data ingestion system, Dataset infrastructure."}]}, {"sections": [{"title": "LEARNING", "text": "Cloud Computing, Storage, Compute, Database Infrastructure, Distributed Systems, Data Security, Infrastructure Monitoring, Scalability, Data Architecture."}, {"title": "FOCUS", "text": "Not just \"processing data,\" but building the infrastructure so data can be used reliably and scalably."}]}]'::jsonb, 1),
  ('core', 'Core AI & Engineering', 'Building AI models and transforming them into real-world AI systems.', '[{"sections": [{"title": "LEARNING", "text": "Supervised Learning, Unsupervised Learning, Regression, Classification, Clustering, Feature Engineering, Model Selection, Model Evaluation, Hyperparameter Tuning, Ensemble Methods."}, {"title": "ALGORITHMS", "text": "Linear Regression, Logistic Regression, Decision Tree, Random Forest, SVM, KNN, XGBoost, Clustering."}, {"title": "OUTPUT", "text": "Prediction system, Classification system, ML experiment, Research, Prototype AI."}]}, {"sections": [{"title": "LEARNING", "text": "Neural Network, Forward & Backpropagation, Optimization, CNN, RNN, LSTM, Transformer, Transfer Learning, Fine-tuning, Model Training."}, {"title": "FRAMEWORKS", "text": "PyTorch, TensorFlow."}, {"title": "OUTPUT", "text": "Deep learning experiment, Trained model, Research, AI prototype."}]}, {"sections": [{"title": "LEARNING", "text": "AI Application Architecture, Model Integration, AI API, Inference, Model Serving, AI Pipeline, AI Backend, Prompt Engineering, AI Evaluation, AI System Design, Production AI, AI Security."}, {"title": "OUTPUT", "text": "AI application, AI API, AI-powered product, AI system, Production prototype."}]}, {"sections": [{"title": "LEARNING", "text": "Model Deployment, Model Serving, CI/CD, Model Versioning, Experiment Tracking, Monitoring, Model Registry, Infrastructure, Containerization, Docker, Cloud Deployment."}, {"title": "TOOLS", "text": "Docker, Git/GitHub, MLflow, Kubernetes, Cloud Platform."}, {"title": "OUTPUT", "text": "Deployable AI model, ML pipeline, AI infrastructure, Monitoring system."}]}]'::jsonb, 2),
  ('language', 'Language & Reasoning', 'Building AI capable of understanding language, generating information, utilizing knowledge, and performing reasoning.', '[{"sections": [{"title": "LEARNING", "text": "Text Processing, Tokenization, Text Classification, Sentiment Analysis, Named Entity Recognition, Text Similarity, Information Extraction, Embedding, Semantic Search, Language Models."}, {"title": "OUTPUT", "text": "Text classifier, Search system, NLP experiment, Information extraction system, Research."}]}, {"sections": [{"title": "LEARNING", "text": "Generative Models, LLM, Prompt Engineering, Embedding, RAG, AI Agents, Fine-tuning, Evaluation, Multistep AI Workflow."}, {"title": "Inside Generative AI", "bullets": ["LLM: Transformer architecture, LLM fundamentals, Prompting, Context management, Embeddings, Model evaluation.", "RAG: Document processing, Chunking, Embedding, Vector database, Retrieval, Reranking, Grounded generation.", "AI Agents: Tool calling, Function calling, Agent workflow, Memory, Planning, Multi-agent system.", "Reasoning: Structured reasoning, Planning, Problem decomposition, Verification, Reasoning evaluation."]}, {"title": "OUTPUT", "text": "RAG application, AI Agent, LLM application, Knowledge assistant, AI research, AI-powered product."}]}]'::jsonb, 3),
  ('vision', 'Vision & Multimodal', 'Building AI capable of understanding visuals, video, and combinations of various information types.', '[{"sections": [{"title": "LEARNING", "text": "Image Processing, Image Classification, Object Detection, Image Segmentation, Image Recognition, Feature Extraction, Image Embedding, Face/Object Analysis, Visual Tracking."}, {"title": "Framework/Tools", "text": "OpenCV, PyTorch, TensorFlow, YOLO."}, {"title": "OUTPUT", "text": "Object detection, Image classification, Visual recognition, Computer vision research, AI prototype."}]}, {"sections": [{"title": "LEARNING", "text": "Image Preprocessing, Text Detection, Text Recognition, Document Understanding, Handwritten Text Recognition, OCR Pipeline.\n(Example: Highly relevant for projects like the digitization of Nusantara scripts)."}]}, {"sections": [{"title": "LEARNING", "text": "Video Processing, Object Tracking, Action Recognition, Temporal Analysis, Video Classification, Video Object Detection, Video Understanding."}]}, {"sections": [{"title": "LEARNING", "text": "Vision + Language, Image + Text, Video + Text, Multimodal Embedding, Vision-Language Models, Multimodal LLM, Multimodal RAG."}, {"title": "OUTPUT", "text": "Image understanding system, OCR system, Video AI, Vision-language application, Multimodal AI research."}]}]'::jsonb, 4),
  ('product', 'Product & Software', 'Turn ideas into impactful digital products through research, design, and development.', '[{"sections": [{"title": "LEARNING", "text": "  - UX Research Learning: User Research, Interview, Observation, Survey, User Persona, User Journey, Problem Discovery, Usability Testing, Information Architecture, UX Evaluation.\n  - UI Design Learning: Design Principles, Visual Design, Typography, Color, Layout, Design System, Component Design, Responsive Design, Prototyping, Design Handoff."}, {"title": "Tools", "text": "Figma, FigJam."}, {"title": "OUTPUT", "text": "User research, User flow, Wireframe, UI Design, Design system, Prototype, Usability testing report."}]}, {"sections": [{"title": "LEARNING", "text": "HTML, CSS, JavaScript, TypeScript, Responsive Web, Component-based Development, API Integration, State Management, Authentication, Web Performance, Accessibility, Front-end Architecture."}, {"title": "FRAMEWORK", "text": "React, Next.js."}, {"title": "OUTPUT", "text": "Website, Web application, Interactive prototype, Production-ready frontend."}]}, {"sections": [{"title": "LEARNING", "text": "Programming Fundamentals, REST API, API Architecture, Database, Authentication, Authorization, Backend Architecture, Server, Security, API Integration, Microservices fundamentals."}, {"title": "TECHNOLOGIES", "text": "Node.js, Python, FastAPI, PostgreSQL, MySQL."}, {"title": "OUTPUT", "text": "REST API, Backend service, Database system, Authentication system, Backend for AI products."}]}, {"sections": [{"title": "LEARNING", "text": "Linux, Git/GitHub, Server, Docker, CI/CD, Cloud, Deployment, Infrastructure, Monitoring, Security, Domain & DNS, Application scaling."}, {"title": "OUTPUT", "text": "Deployment pipeline, Cloud infrastructure, Production environment, Monitoring system."}]}]'::jsonb, 5),
  ('growth', 'Growth & Community', 'Grow people, grow community, and make ideas, projects, and impact visible.', '[{"sections": [{"title": "FOCUS", "text": "Building Data Sorcerers'' communication and public reputation."}, {"title": "LEARNING", "text": "Public Relations, Communication Strategy, Media Relations, Press Release, Brand Communication, Copywriting, Storytelling, Community Communication, Crisis Communication, External Communication."}, {"title": "OUTPUT", "text": "Press release, Media publication, Community announcement, Organization profile, Campaign communication, Public communication."}]}, {"sections": [{"title": "FOCUS", "text": "Translating knowledge, projects, research, and Data Sorcerers'' activities into engaging and easily understandable visual communication."}, {"title": "LEARNING", "text": "Graphic Design, Visual Communication, Content Design, Social Media Design, Illustration, Motion Design, Video Production, Video Editing, Creative Direction, Content Strategy."}, {"title": "TOOLS", "text": "Figma, Adobe Illustrator, Photoshop, Premiere Pro, After Effects, Blender (optional)."}, {"title": "OUTPUT", "text": "Social media content, Campaign visual, Video, Project showcase, Research visualization, Event visual, Brand assets."}]}, {"sections": [{"title": "FOCUS", "text": "Building relationships between Data Sorcerers and its members, communities, universities, industries, researchers, and partners."}, {"title": "LEARNING", "text": "  - Community Learning: Community Building, Community Engagement, Member Experience, Community Activation, Event Community, Community Retention, Networking, Collaboration.\n  - Partnership Learning: Partnership Strategy, Stakeholder Management, Proposal, Negotiation, Collaboration, Sponsorship, Industry Relations, Academic Relations, Government/Institution Relations."}, {"title": "OUTPUT", "text": "Community collaboration, Partnership, Industry collaboration, University collaboration, Speaker/network, Sponsorship, External project."}]}]'::jsonb, 6)
on conflict (id) do nothing;

commit;

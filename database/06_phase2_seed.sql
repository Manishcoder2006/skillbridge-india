-- ==============================================================================
-- SkillBridge India - Phase 2 Seed Data: Student Ecosystem
-- ==============================================================================

-- 1. Assessments
INSERT INTO public.assessments (id, title, category, description, duration_minutes, total_questions, passing_percentage, difficulty)
VALUES
    ('d1000000-0000-0000-0000-000000000001', 'Full Stack Web Development Readiness', 'Web Development', 'Assess core proficiency in modern React, RESTful APIs, state management, and responsive frontend architecture.', 15, 5, 60, 'intermediate'),
    ('d1000000-0000-0000-0000-000000000002', 'Data Structures & Algorithms in Python', 'Software Engineering', 'Evaluate core algorithmic thinking, data structure operations, and computational complexity analysis.', 20, 5, 70, 'advanced'),
    ('d1000000-0000-0000-0000-000000000003', 'Cloud Fundamentals & DevOps Principles', 'Cloud & Infrastructure', 'Assess understanding of containerization, CI/CD pipelines, cloud deployment models, and microservices.', 15, 5, 60, 'intermediate'),
    ('d1000000-0000-0000-0000-000000000004', 'Workplace Communication & Professional Skills', 'Soft Skills', 'Evaluate industry collaboration standards, technical communication, and agile teamwork principles.', 10, 4, 75, 'beginner')
ON CONFLICT (id) DO NOTHING;

-- 2. Assessment Questions
INSERT INTO public.assessment_questions (id, assessment_id, question_text, options, correct_option_index, skill_tag, explanation)
VALUES
    -- Web Dev Questions
    ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'What hook is used in React to manage asynchronous side-effects such as data fetching or subscriptions?', '["useState", "useEffect", "useMemo", "useReducer"]'::JSONB, 1, 'React', 'useEffect is the standard React hook designed for executing side-effects after component rendering.'),
    ('e1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'Which HTTP status code signifies that a client is unauthenticated (missing or invalid credentials)?', '["400 Bad Request", "401 Unauthorized", "403 Forbidden", "404 Not Found"]'::JSONB, 1, 'REST APIs', '401 Unauthorized indicates missing or invalid authentication credentials.'),
    ('e1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'In responsive CSS layouts, which property enables flexible container distribution across dynamic screen widths?', '["float", "display: flex", "position: absolute", "clear: both"]'::JSONB, 1, 'Responsive CSS', 'Flexbox (display: flex) allows flexible and adaptive distribution of container space.'),
    ('e1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 'What is the purpose of Row Level Security (RLS) in PostgreSQL databases?', '["Encrypt database disk storage", "Restrict which table rows users can access based on security policies", "Automatically back up database logs", "Speed up database index creation"]'::JSONB, 1, 'Database Security', 'RLS enforces security policies at the database layer ensuring users access only authorized rows.'),
    ('e1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000001', 'In FastAPI, what Pydantic feature provides automatic request payload validation and parsing?', '["BaseSettings", "BaseModel", "FieldValidator", "Depends"]'::JSONB, 1, 'FastAPI', 'Pydantic BaseModel defines strict validation schemas for request and response payloads.'),

    -- Python & DSA Questions
    ('e1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000002', 'What is the average time complexity of searching for a key in a Python dictionary (hash map)?', '["O(n)", "O(log n)", "O(1)", "O(n^2)"]'::JSONB, 2, 'Python', 'Hash maps offer average constant time complexity O(1) for key lookups.'),
    ('e1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000002', 'Which data structure follows the First-In, First-Out (FIFO) access principle?', '["Stack", "Queue", "Binary Search Tree", "Max Heap"]'::JSONB, 1, 'Data Structures', 'A Queue follows the FIFO structure where the first element inserted is the first removed.'),
    ('e1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000002', 'In Python, what is the key difference between a list and a tuple?', '["Lists are immutable, tuples are mutable", "Lists are mutable, tuples are immutable", "Tuples cannot hold integers", "Lists cannot be sorted"]'::JSONB, 1, 'Python', 'Lists can be modified after creation (mutable), whereas tuples cannot (immutable).'),
    ('e1000000-0000-0000-0000-000000000009', 'd1000000-0000-0000-0000-000000000002', 'Which sorting algorithm has a worst-case time complexity of O(n log n)?', '["Bubble Sort", "Insertion Sort", "Merge Sort", "Quick Sort"]'::JSONB, 2, 'Algorithms', 'Merge Sort guarantees O(n log n) time complexity across best, average, and worst cases.'),
    ('e1000000-0000-0000-0000-000000000010', 'd1000000-0000-0000-0000-000000000002', 'What algorithm paradigm is used in Dijkstra shortest path computation?', '["Greedy Method", "Brute Force", "Backtracking", "Divide and Conquer"]'::JSONB, 0, 'Algorithms', 'Dijkstra algorithm uses a greedy approach picking the lowest-distance unvisited node.')
ON CONFLICT (id) DO NOTHING;

-- 3. Learning Resources
INSERT INTO public.learning_resources (id, title, category, skill_tag, resource_type, provider, duration, url, level, is_free, rating)
VALUES
    ('f1000000-0000-0000-0000-000000000001', 'Modern React 18 & State Architecture', 'Web Development', 'React', 'course', 'SWAYAM / NPTEL', '4 weeks', 'https://swayam.gov.in', 'intermediate', true, 4.9),
    ('f1000000-0000-0000-0000-000000000002', 'FastAPI High-Performance Backend Engineering', 'Backend Engineering', 'FastAPI', 'tutorial', 'SkillBridge Labs', '6 hours', 'https://fastapi.tiangolo.com', 'intermediate', true, 4.8),
    ('f1000000-0000-0000-0000-000000000003', 'Database Modeling & PostgreSQL Row Level Security', 'Databases', 'PostgreSQL', 'workshop', 'IIT Delhi Open Courseware', '3 hours', 'https://www.postgresql.org/docs/', 'advanced', true, 4.9),
    ('f1000000-0000-0000-0000-000000000004', 'Python for Algorithmic Problem Solving', 'Software Engineering', 'Python', 'course', 'AICTE / NEAT Portal', '8 weeks', 'https://neat.aicte-india.org', 'intermediate', true, 4.7),
    ('f1000000-0000-0000-0000-000000000005', 'Cloud Infrastructure & Docker Containerization', 'DevOps', 'Docker', 'video', 'NPTEL Cloud Series', '5 hours', 'https://nptel.ac.in', 'intermediate', true, 4.8),
    ('f1000000-0000-0000-0000-000000000006', 'Executive Technical Writing & Professional Communication', 'Soft Skills', 'Communication', 'pdf', 'National Skill Development Corp', '2 hours', 'https://nsdcindia.org', 'beginner', true, 4.6)
ON CONFLICT (id) DO NOTHING;

-- 4. Opportunities (Jobs & Internships)
INSERT INTO public.opportunities (id, company_name, title, type, location, work_mode, stipend_or_salary, required_skills, eligibility, description, application_deadline)
VALUES
    ('g1000000-0000-0000-0000-000000000001', 'Tata Consultancy Services', 'Software Engineer Intern (Full Stack)', 'internship', 'Bengaluru / Pune', 'hybrid', '₹25,000 / month', ARRAY['React', 'Python', 'REST APIs', 'PostgreSQL'], 'Open to 3rd & 4th Year B.Tech / BE CSE & IT students with CGPA >= 7.0', 'Join TCS Innovation Labs to develop scalable full stack enterprise cloud applications. Work alongside principal architects.', '2026-10-31'),
    ('g1000000-0000-0000-0000-000000000002', 'Infosys Limited', 'Associate Software Engineer - Cloud & Systems', 'job', 'Hyderabad / Chennai', 'on_site', '₹7.5 LPA', ARRAY['Python', 'Data Structures', 'Docker', 'Linux'], 'Final Year B.Tech / MCA graduates (2026 Batch)', 'Exciting opportunity for entry-level software engineers to build robust microservices and distributed cloud infrastructure.', '2026-11-15'),
    ('g1000000-0000-0000-0000-000000000003', 'Larsen & Toubro', 'Smart Technology R&D Intern', 'internship', 'Mumbai', 'hybrid', '₹30,000 / month', ARRAY['Python', 'FastAPI', 'PostgreSQL', 'Git'], 'Pre-final & Final year students in Engineering / Technology', 'Participate in industrial automation and digital transformation platforms built for nation-scale infrastructure projects.', '2026-10-20'),
    ('g1000000-0000-0000-0000-000000000004', 'Tata Consultancy Services', 'Frontend Developer Trainee', 'job', 'New Delhi / Gurugram', 'hybrid', '₹8.0 LPA', ARRAY['React', 'JavaScript', 'Responsive CSS', 'UI/UX'], 'Graduating engineering students with strong frontend portfolio', 'Create high-accessibility user experiences for government digital services and modern web applications.', '2026-12-01')
ON CONFLICT (id) DO NOTHING;

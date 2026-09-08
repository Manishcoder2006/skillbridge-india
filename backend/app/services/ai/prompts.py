from typing import Dict, Any, List, Optional

def sanitize_user_context(context: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitizes context dictionary by removing passwords, tokens, and private system attributes."""
    blocked_keys = {"password", "hashed_password", "token", "sb_secret_key", "secret", "refresh_token"}
    sanitized = {}
    for k, v in context.items():
        if k.lower() in blocked_keys:
            continue
        if isinstance(v, dict):
            sanitized[k] = sanitize_user_context(v)
        elif isinstance(v, list):
            sanitized[k] = [sanitize_user_context(i) if isinstance(i, dict) else i for i in v]
        else:
            sanitized[k] = v
    return sanitized


class PromptTemplates:
    """Standardized prompts for SkillBridge India AI Agents."""

    SYSTEM_BASE = (
        "You are the SkillBridge India AI Engine. "
        "Your mission is to bridge academia and industry by mapping skills, guiding students, "
        "assisting faculty, and empowering corporate recruiters. "
        "Always respond in valid, parseable JSON strictly conforming to the requested schema. "
        "Do not include markdown code fence formatting or conversational preamble outside the JSON."
    )

    @staticmethod
    def student_skill_gap_prompt(student_name: str, skills: List[str], assessment_score: int, target_role: str) -> str:
        return f"""Analyze the student's profile for the target role '{target_role}'.
Student Name: {student_name}
Verified Skills: {', '.join(skills)}
Recent Diagnostic Assessment Score: {assessment_score}/100

Generate a JSON object with:
{{
  "target_role": "{target_role}",
  "readiness_percentage": <integer between 0 and 100>,
  "strengths": [<list of 3-5 confirmed strengths>],
  "identified_gaps": [
    {{
      "skill_name": "<skill>",
      "current_level": "beginner|intermediate|unverified",
      "target_level": "advanced|proficient",
      "gap_severity": "Critical|Moderate|Minor",
      "remediation_hint": "<practical advice to master this skill>"
    }}
  ],
  "action_plan_steps": [<3-4 actionable sequential steps to bridge the gap>]
}}"""

    @staticmethod
    def student_career_guidance_prompt(student_name: str, skills: List[str], cgpa: float, interests: List[str]) -> str:
        return f"""Provide career pathway recommendations for engineering student:
Name: {student_name}
Skills: {', '.join(skills)}
CGPA: {cgpa}
Interests: {', '.join(interests) if interests else 'Full Stack, Cloud, AI'}

Generate a JSON object with:
{{
  "primary_recommendations": [
    {{
      "role_title": "<Role title>",
      "match_percentage": <int 60-98>,
      "growth_outlook": "High Demand / 28% YoY Growth",
      "average_starting_salary": "₹8.0 - 14.0 LPA",
      "key_required_skills": [<3-4 skills>],
      "why_recommended": "<1 sentence reasoning>"
    }}
  ],
  "alternative_domains": [<2-3 adjacent domains>],
  "industry_sector_trends": "<Brief 1-2 sentence industry hiring outlook for India 2026>"
}}"""

    @staticmethod
    def resume_optimizer_prompt(
        name: str,
        current_summary: str,
        skills: List[str],
        target_role: str,
        job_description: Optional[str] = None,
        projects_summary: Optional[str] = "",
        experience_summary: Optional[str] = ""
    ) -> str:
        jd_context = f"\nTarget Job Description:\n{job_description}" if job_description else ""
        proj_context = f"\nKey Projects: {projects_summary}" if projects_summary else ""
        exp_context = f"\nExperience: {experience_summary}" if experience_summary else ""

        return f"""You are an expert AI Resume Reviewer and ATS Optimization Engine for SkillBridge India.
Analyze the candidate's resume against the target role and job description with strict ATS compliance rules (quantifiable impact, action verbs, keyword density, skills alignment).

Candidate: {name}
Target Role: {target_role}
Current Summary: {current_summary or 'None provided'}
Candidate Skills: {', '.join(skills) if skills else 'None listed'}{proj_context}{exp_context}{jd_context}

Generate a valid, parseable JSON object with the following schema:
{{
  "overall_ats_score": <realistic integer score 60-98 based on alignment>,
  "keyword_match_score": <integer percentage 50-98 representing keyword overlap>,
  "matched_keywords": [<list of 4-8 important technical/domain keywords present in both resume and JD>],
  "missing_keywords": [<list of 4-8 critical industry keywords present in JD or standard for role but absent in resume>],
  "matched_skills": [<list of candidate skills that align directly with role>],
  "missing_skills": [<list of 3-6 recommended high-demand skills to acquire or add>],
  "strengths": [<list of 2-4 specific strong points found in the resume>],
  "weaknesses": [<list of 2-4 areas where the resume falls short e.g. lack of metrics, missing tools>],
  "formatting_warnings": [<list of 1-3 ATS formatting/styling warnings e.g. avoid graphics, ensure standard section headers>],
  "actionable_improvements": [<list of 3-5 concrete step-by-step improvements to boost score>],
  "summary_critique": "<2-sentence constructive critique on impact, clarity, and keyword density>",
  "enhanced_summary_draft": "<high-impact ATS-optimized 2-3 sentence executive summary with active metrics and keywords tailored to role>",
  "bullet_point_improvements": [
    {{
      "original_example": "<a weak/generic bullet point from typical student resumes>",
      "improved_bullet": "<a powerful, quantified, impact-driven bullet point with metrics and tech stack>"
    }},
    {{
      "original_example": "<another generic project bullet point>",
      "improved_bullet": "<improved quantified bullet with action verb and result>"
    }}
  ],
  "recommended_keywords_to_add": [<list of top 6 recommended keywords for ATS search filters>]
}}"""

    @staticmethod
    def resume_bullet_improve_prompt(bullet_text: str, target_role: Optional[str] = None, context_type: str = "experience") -> str:
        role_ctx = f" for a candidate pursuing a {target_role} role" if target_role else ""
        return f"""You are an elite ATS resume coach{role_ctx}.
Rewrite the following resume bullet point to make it highly impactful, action-verb driven, quantified where possible, and ATS friendly.
DO NOT invent false company names or degrees. Preserve the candidate's core accomplishment and enhance the phrasing with industry best practices (Action Verb + Task/Tech + Quantified Result/Impact).

Input Bullet: "{bullet_text}"

Return a JSON object:
{{
  "original": "{bullet_text}",
  "improved": "<re-written impactful bullet point>",
  "action_verb_used": "<the primary strong action verb used>",
  "quantification_tip": "<a brief 1-sentence tip on what specific number or metric the student could customize here>",
  "keywords_added": [<list of 2-4 ATS technical or action keywords added>]
}}"""

    @staticmethod
    def resume_summary_generate_prompt(
        target_role: Optional[str],
        skills: List[str],
        experience_highlights: List[str],
        education_highlights: List[str],
        tone: str = "impactful"
    ) -> str:
        role = target_role or "Software & Systems Engineer"
        skills_str = ", ".join(skills) if skills else "Modern software engineering and problem-solving"
        exp_str = "; ".join(experience_highlights) if experience_highlights else "Academic and independent project experience"
        edu_str = "; ".join(education_highlights) if education_highlights else "Relevant technical coursework and foundational knowledge"

        return f"""You are an expert executive resume writer for SkillBridge India.
Write an authentic, highly professional 2-3 sentence resume executive summary tailored to the target role '{role}'.
Tone: {tone}.

Candidate Background:
- Key Skills: {skills_str}
- Projects & Experience Highlights: {exp_str}
- Education: {edu_str}

Ensure the summary highlights core strengths, demonstrated capabilities, and alignment with modern industry standards.

Return a JSON object:
{{
  "summary": "<2-3 sentence polished professional executive summary>",
  "keywords_included": [<list of 3-5 technical/role keywords seamlessly incorporated>],
  "estimated_word_count": <integer word count>
}}"""

    @staticmethod
    def candidate_matching_prompt(job_title: str, req_skills: List[str], candidates: List[Dict[str, Any]]) -> str:
        candidates_summary = "\n".join([
            f"- ID: {c.get('student_id')}, Name: {c.get('name')}, CGPA: {c.get('cgpa')}, Skills: {', '.join(c.get('skills', []))}"
            for c in candidates
        ])
        return f"""Evaluate and rank candidates for the position '{job_title}'.
Job Required Skills: {', '.join(req_skills)}

Candidate Pool:
{candidates_summary}

Generate a JSON object with:
{{
  "ranked_candidates": [
    {{
      "student_id": "<ID>",
      "candidate_name": "<Name>",
      "candidate_institution": "IIT Delhi",
      "match_score": <integer 0-100>,
      "compatibility_tier": "High Match|Moderate Match|Low Match",
      "matching_skills": [<matched skills>],
      "missing_critical_skills": [<missing skills>],
      "key_strengths": [<2 strengths>],
      "potential_risk_factors": [<1-2 notes on training needs>],
      "recruiter_summary_rationale": "<Recruiter-facing 1-2 sentence summary>",
      "suggested_next_step": "Fast-track to Interview|Send Technical Assessment|Suggest Pre-requisite"
    }}
  ]
}}"""

    @staticmethod
    def academician_cohort_prompt(dept_name: str, students: List[Dict[str, Any]]) -> str:
        return f"""Generate department-level pedagogical and skill intelligence for {dept_name}.
Analyzed Students: {len(students)}

Generate a JSON object with:
{{
  "department_name": "{dept_name}",
  "total_students_evaluated": {len(students)},
  "mean_readiness_score": 82,
  "strongest_cohort_competencies": ["React Web Engineering", "Python Fundamentals", "REST Architecture"],
  "critical_cohort_skill_gaps": [
    {{
      "skill": "Docker Containerization & Kubernetes",
      "affected_percentage": 58,
      "severity": "High"
    }},
    {{
      "skill": "PostgreSQL Query Optimization & Indexing",
      "affected_percentage": 42,
      "severity": "Medium"
    }}
  ],
  "pedagogical_interventions": [
    "Introduce a 2-week hands-on lab on Microservices and Docker CI/CD.",
    "Partner with industry for live database indexing hackathons."
  ]
}}"""

    @staticmethod
    def learning_recommendations_prompt(
        topic_or_query: str,
        student_skills: List[str],
        rag_resources: List[Dict[str, Any]]
    ) -> str:
        rag_text = "\n".join([
            f"- [{r.get('title')}] ({r.get('category')} / {r.get('skill_tag')}): {r.get('content')} | Provider: {r.get('provider')} | Level: {r.get('level')} | Duration: {r.get('duration')} | URL: {r.get('url')}"
            for r in rag_resources
        ]) if rag_resources else "None retrieved"

        return f"""You are the SkillBridge India Elite AI Pedagogical & Learning Architect.
The student has submitted the following learning query / focus topic:
"{topic_or_query}"

Student Background Skills: {', '.join(student_skills) if student_skills else 'Beginner / General'}

Retrieved RAG Learning Resources & Context (Strictly prioritize these domain-specific resources):
{rag_text}

MANDATORY RULES:
1. The student's CURRENT QUERY/TOPIC ("{topic_or_query}") MUST strictly control the learning recommendations.
2. If the student asks for English, communication, language, grammar, or speaking, you MUST generate an English communication learning roadmap. DO NOT generate frontend/web development/React/JavaScript content!
3. If the student asks for Python, generate a Python roadmap.
4. If the student asks for React, generate a React roadmap.
5. Incorporate the retrieved RAG learning resources directly into the recommended courses.

Respond in strict JSON with the following structure:
{{
  "learning_path_title": "<Concise, inspiring roadmap title strictly matching the requested topic>",
  "estimated_completion_weeks": 4,
  "recommended_courses": [
    {{
      "title": "<Course/Tutorial Title>",
      "provider": "<Provider e.g. Swayam, British Council, NPTEL, SkillBridge>",
      "url": "<URL>",
      "skill_tag": "<Specific Skill Tag>",
      "level": "beginner|intermediate|advanced",
      "duration": "<e.g. 4 weeks, 6 hours>",
      "is_platform_resource": true,
      "match_reason": "<1-sentence reason why this addresses the student's current topic>"
    }}
  ]
}}"""

    @staticmethod
    def interview_questions_generate_prompt(
        role: str,
        interview_type: str,
        experience_level: str,
        skills: List[str],
        num_questions: int,
        resume_summary: Optional[str] = None,
        job_description: Optional[str] = None,
        custom_instructions: Optional[str] = None,
        rag_competencies: Optional[List[Dict[str, Any]]] = None
    ) -> str:
        skills_str = ", ".join(skills) if skills else "Core domain skills"
        resume_ctx = f"\nCandidate Verified Resume Context:\n{resume_summary}" if resume_summary else ""
        jd_ctx = f"\nTarget Job Description:\n{job_description}" if job_description else ""
        custom_ctx = f"\nCustom Instructions:\n{custom_instructions}" if custom_instructions else ""

        rag_ctx = ""
        if rag_competencies:
            rag_lines = "\n".join([f"- [{c.get('category')}]: {c.get('content')}" for c in rag_competencies])
            rag_ctx = f"\nRetrieved RAG Competency Context for {role}:\n{rag_lines}\n"

        return f"""You are the SkillBridge India Elite AI Interviewer.
Generate exactly {num_questions} realistic, highly tailored, diverse interview questions for:
Target Role: {role}
Interview Mode: {interview_type.upper()} (Technical, HR, or Custom)
Experience Level: {experience_level}
Key Skills: {skills_str}{resume_ctx}{jd_ctx}{custom_ctx}{rag_ctx}

MANDATORY RULES:
1. Target Role "{role}" and Mode "{interview_type}" MUST strictly control question generation.
2. If role is "Python Developer" or backend, questions MUST focus on Python, data structures, GIL, async, backend architecture. NEVER ask React or frontend questions.
3. If role is "Frontend Developer", questions MUST focus on frontend, React, DOM, state, CSS.
4. If role is "HR Interview", questions MUST focus on behavioral STAR scenarios, communication, ethics, teamwork.
5. Every generated question MUST be dynamically formulated (avoid repeating identical static question text across sessions).
6. For each question, provide 3 to 5 concrete 'expected_key_points' that an ideal answer MUST address.

Respond in strict JSON with the following structure:
{{
  "questions": [
    {{
      "id": "q-1",
      "question_number": 1,
      "question_text": "<Detailed, conversational, professional interview question>",
      "category": "<Category e.g. Algorithms / Databases / Behavioral / System Design>",
      "difficulty": "beginner|intermediate|advanced",
      "hint": "<A short helpful guidance tip or thought framework for the student>",
      "evaluation_criteria": ["<Key criterion 1>", "<Key criterion 2>", "<Key criterion 3>"],
      "expected_key_points": [
        "<Essential concept 1 that must be explained>",
        "<Essential concept 2 that must be explained>",
        "<Essential concept 3 that must be explained>"
      ]
    }}
  ]
}}"""

    @staticmethod
    def interview_answer_evaluation_prompt(
        role: str,
        question_text: str,
        category: str,
        answer_text: str,
        evaluation_criteria: Optional[List[str]] = None,
        expected_key_points: Optional[List[str]] = None,
        interview_type: str = "technical"
    ) -> str:
        criteria_str = ", ".join(evaluation_criteria) if evaluation_criteria else "Correctness, technical depth, clarity"
        key_points_list = expected_key_points or evaluation_criteria or [
            "Demonstration of core concept",
            "Accurate technical explanation or behavioral context",
            "Clear articulation of tradeoffs or outcomes"
        ]
        key_points_str = "\n".join([f"- {kp}" for kp in key_points_list])

        is_hr = str(interview_type).lower() == "hr"

        if is_hr:
            rubric_instructions = """EVALUATION RUBRIC FOR HR / BEHAVIORAL INTERVIEW:
Evaluate on 4 specific dimensions (Total 100 points maximum):
1. Behavioral Relevance / Alignment (0 to 40):
   - Does the candidate actually answer the prompt with a genuine, relevant personal or academic scenario?
   - If completely off-topic or irrelevant: award <= 5 points and set is_off_topic=true.
2. Communication / Clarity (0 to 25):
   - Is the response articulate, structured, clear, and professional?
3. Completeness / Context (0 to 20):
   - Does the candidate provide sufficient context (Situation, Task, Action, Result)?
4. Professionalism / Consistency (0 to 15):
   - Demonstrates workplace ethics, maturity, teamwork, accountability, and self-awareness.

NOTE FOR HR: Do NOT demand technical/programming keywords. Evaluate behavioral reasoning, communication, and interpersonal maturity."""
        else:
            rubric_instructions = """EVALUATION RUBRIC FOR TECHNICAL INTERVIEW:
Evaluate on 4 specific dimensions (Total 100 points maximum):
1. Technical Correctness (0 to 40):
   - Is the explanation accurate according to computer science & software engineering principles?
   - If fundamentally incorrect or displaying major misconceptions: award <= 10 points and set is_fundamentally_incorrect=true.
   - If completely off-topic or discussing something unrelated: award <= 5 points.
2. Relevance to Question (0 to 25):
   - Does the answer address what was asked?
   - If completely off-topic: award <= 5 points and set is_off_topic=true.
3. Completeness / Depth (0 to 20):
   - Did the candidate cover the critical expected concepts without major gaps?
4. Communication / Clarity (0 to 15):
   - Is the terminology used accurately and explained clearly?

NOTE FOR TECHNICAL:
- STRICT: Technical correctness and relevance must dominate.
- Do NOT reward length, verbosity, confidence, filler, or keyword stuffing.
- If a candidate writes a long paragraph about Python projects when asked about process vs thread, it is OFF-TOPIC.
- Short answers that completely and accurately answer the question (e.g. 'Hypertext Transfer Protocol' for HTTP) MUST receive high scores (85-100). Do NOT penalize brevity when accurate."""

        return f"""You are the SkillBridge India Senior Evaluator.
Evaluate the candidate's answer strictly, objectively, and content-aware.

Target Role: {role}
Interview Mode: {interview_type.upper()}
Category: {category}
Question Asked:
"{question_text}"

Expected Key Points:
{key_points_str}

General Evaluation Criteria:
{criteria_str}

Candidate's Submitted Answer:
"{answer_text}"

{rubric_instructions}

CONTENT-AWARE & SEMANTIC MATCHING GUIDELINES:
- Compare the answer SEMANTICALLY with the question and expected key points.
- Identify which expected concepts the candidate ACTUALLY covered (covered_key_points).
- Identify which expected concepts the candidate MISSED (missing_key_points).
- Score bands guidance:
  * 0–5: Refusal, gibberish, empty, or completely unusable.
  * 6–20: Clearly off-topic, irrelevant, or nonsensical answer.
  * 21–40: Very weak answer with major misconceptions or missing core concepts.
  * 41–60: Partially correct answer with significant gaps.
  * 61–75: Generally correct answer with minor omissions.
  * 76–89: Strong and relevant answer covering most critical points.
  * 90–100: Excellent, accurate, complete, and precise answer.

Respond strictly in valid JSON format:
{{
  "is_off_topic": false,
  "is_fundamentally_incorrect": false,
  "technical_correctness": <integer 0-40 (or 0 for HR)>,
  "relevance": <integer 0-25 for technical, 0-40 for HR>,
  "completeness": <integer 0-20>,
  "communication": <integer 0-15 for technical, 0-25 for HR>,
  "professionalism": <integer 0-15 for HR, 0 for technical>,
  "assessment": "<Brief concise evaluation e.g. Excellent / Strong and accurate / Partially correct with missing depth / Off-topic response>",
  "covered_key_points": [
    "<Concept 1 that the candidate successfully explained>"
  ],
  "missing_key_points": [
    "<Concept 2 that the candidate omitted or failed to explain>"
  ],
  "strengths": [
    "<1-2 specific factual strengths of what candidate explained>"
  ],
  "improvements": [
    "<1-2 actionable technical or behavioral points to improve>"
  ],
  "suggested_answer_points": [
    "<2-3 concise points an ideal candidate would mention>"
  ]
}}"""

    @staticmethod
    def interview_adaptive_next_question_prompt(
        role: str,
        interview_type: str,
        experience_level: str,
        previous_qa: List[Dict[str, Any]],
        next_question_number: int,
        total_questions: int
    ) -> str:
        qa_history = "\n".join([
            f"Q{item.get('question_number', idx + 1)}: {item.get('question_text', '')} (Category: {item.get('category', 'General')})\n"
            f"Candidate Spoken Answer: \"{item.get('answer_text', '')}\"\n"
            f"Evaluation Score: {item.get('score', 70)}/100\n"
            for idx, item in enumerate(previous_qa)
        ])
        return f"""You are the SkillBridge India Adaptive AI Interviewer.
Target Role: {role}
Interview Type: {interview_type.upper()}
Experience Level: {experience_level}
Current Progress: Question {next_question_number} of {total_questions}

Candidate's Previous Performance and Spoken Answers:
{qa_history}

Generate the NEXT adaptive interview question (Question {next_question_number} of {total_questions}):
- If the candidate answered previous questions strongly (score >= 75), elevate the depth: test architectural tradeoffs, edge cases, scalability, or complex real-world decisions.
- If the candidate gave a weak or basic answer (score <= 50), pivot to test core underlying fundamentals and foundational principles.
- Ensure the question is spoken cleanly, conversational, and explores a fresh dimension.
- Include 3 to 5 expected_key_points.

Respond in strict JSON:
{{
  "id": "q-{next_question_number}",
  "question_number": {next_question_number},
  "question_text": "<Clear, spoken, conversational interview question>",
  "category": "<Category e.g. System Design / Databases / Concurrency / Behavioral / Architecture>",
  "difficulty": "beginner|intermediate|advanced",
  "hint": "<A concise thinking framework to guide the candidate>",
  "evaluation_criteria": ["<Key concept 1>", "<Key concept 2>", "<Key concept 3>"],
  "expected_key_points": [
    "<Expected concept 1>",
    "<Expected concept 2>",
    "<Expected concept 3>"
  ]
}}"""

    @staticmethod
    def interview_final_report_prompt(
        role: str,
        interview_type: str,
        evaluations_summary: List[Dict[str, Any]]
    ) -> str:
        eval_json_str = str(evaluations_summary)

        return f"""You are the SkillBridge India Senior AI Interview Evaluator.
Synthesize a comprehensive final performance evaluation for a completed {interview_type.upper()} interview for role '{role}'.

Question Responses & Scores Summary:
{eval_json_str}

Generate a comprehensive JSON evaluation report:
{{
  "overall_score": <integer 0-100>,
  "category_scores": [
    {{"category": "Technical Depth", "score": <0-100>}},
    {{"category": "Communication", "score": <0-100>}},
    {{"category": "Problem Solving", "score": <0-100>}},
    {{"category": "Role Relevance", "score": <0-100>}}
  ],
  "strengths": [<3-4 major standout capabilities demonstrated across the interview>],
  "weaknesses": [<2-3 specific areas where the candidate lacked depth or structure>],
  "questions_answered_well": [<1-2 specific question topics where candidate scored highest>],
  "questions_needing_improvement": [<1-2 question topics requiring further study>],
  "personalized_recommendations": [<2-3 specific pedagogical action items>],
  "suggested_skills_to_practice": [<3-4 specific technical or behavioral skills to upskill>],
  "recommended_next_steps": [<2-3 immediate next steps on SkillBridge India portal>]
}}"""


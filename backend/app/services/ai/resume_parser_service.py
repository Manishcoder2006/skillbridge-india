import io
import re
import logging
from typing import Dict, Any, List, Optional, Tuple
from fastapi import HTTPException, status
import docx
import pypdf

logger = logging.getLogger("skillbridge.ai.resume_parser")

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
SUPPORTED_EXTENSIONS = {".pdf", ".docx"}

# Common canonical technical & soft skills for entity recognition
KNOWN_SKILLS = [
    # Languages
    "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "C", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "SQL", "R", "Scala",
    # Frontend
    "React", "React.js", "Next.js", "Angular", "Vue", "Vue.js", "HTML", "HTML5", "CSS", "CSS3", "Tailwind", "Tailwind CSS", "Bootstrap", "Redux", "Zustand", "Sass", "Webpack", "Vite",
    # Backend & Frameworks
    "FastAPI", "Django", "Flask", "Node.js", "Express", "Express.js", "Spring", "Spring Boot", "ASP.NET", ".NET", "GraphQL", "REST APIs", "Microservices", "gRPC",
    # Databases
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle", "Cassandra", "DynamoDB", "Elasticsearch", "Supabase", "Firebase",
    # Cloud & DevOps
    "AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Jenkins", "Terraform", "Linux", "Nginx",
    # AI / ML & Data
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "NumPy", "NLP", "Computer Vision", "LLMs", "RAG", "LangChain", "OpenAI",
    # Core & Methodologies
    "Data Structures", "Algorithms", "System Design", "OOP", "Object-Oriented Programming", "Git", "GitHub", "Agile", "Scrum", "TDD", "Unit Testing", "Debugging"
]


class ResumeParserService:
    """
    Enterprise Resume Ingestion & Parsing Service.
    Securely validates file format, binary magic bytes, file size, extracts text,
    and structures key competencies (skills, projects, experience, education).
    """

    def validate_file_metadata(self, filename: str, file_size: int) -> str:
        """
        Validates file extension and size constraints.
        Returns the sanitized extension (.pdf or .docx).
        """
        if not filename or "." not in filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file name: missing file extension."
            )

        # Prevent path traversal
        clean_filename = re.sub(r"[^a-zA-Z0-9_\-\. ]", "", filename)
        ext = "." + clean_filename.rsplit(".", 1)[-1].lower()

        if ext not in SUPPORTED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{ext}'. Supported formats: PDF, DOCX."
            )

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=getattr(status, "HTTP_413_CONTENT_TOO_LARGE", 413),
                detail=f"File size ({round(file_size / (1024 * 1024), 2)} MB) exceeds maximum allowed size of 5 MB."
            )

        if file_size <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty (0 bytes)."
            )

        return ext

    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        """Extracts text from PDF bytes using pypdf."""
        if not file_bytes.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid PDF file: corrupted or invalid file signature."
            )

        try:
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            if reader.is_encrypted:
                try:
                    # Attempt empty password decryption
                    reader.decrypt("")
                except Exception:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Password-protected PDF files are not supported. Please remove the password and try again."
                    )

            extracted_pages = []
            for page_idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    extracted_pages.append(page_text.strip())

            full_text = "\n\n".join(extracted_pages)
            if len(full_text.strip()) < 20:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Could not extract readable text from PDF. Document appears to be empty, scanned image-only, or non-textual."
                )
            return full_text
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"[ResumeParser] PDF parsing error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Corrupted or unreadable PDF document. Please verify the file integrity."
            )

    def extract_text_from_docx(self, file_bytes: bytes) -> str:
        """Extracts text from DOCX bytes using python-docx."""
        # DOCX files are zip archives starting with PK\x03\x04
        if not file_bytes.startswith(b"PK\x03\x04"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid DOCX file: corrupted or invalid file signature."
            )

        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            parts = []

            # Paragraphs
            for p in doc.paragraphs:
                txt = p.text.strip()
                if txt:
                    parts.append(txt)

            # Tables
            for table in doc.tables:
                for row in table.rows:
                    row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                    if row_cells:
                        parts.append(" | ".join(row_cells))

            full_text = "\n".join(parts)
            if len(full_text.strip()) < 20:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Could not extract readable text from DOCX. Document contains no text content."
                )
            return full_text
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"[ResumeParser] DOCX parsing error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Corrupted or unreadable DOCX document. Please verify the file integrity."
            )

    def parse_skills_from_text(self, text: str) -> List[str]:
        """Identifies mentioned technical and soft skills in the text."""
        found_skills = set()
        text_lower = f" {text.lower()} "

        for skill in KNOWN_SKILLS:
            # Word boundary check
            pattern = r"(?i)\b" + re.escape(skill.lower()) + r"\b"
            if re.search(pattern, text_lower):
                found_skills.add(skill)

        return sorted(list(found_skills))

    def parse_projects_from_text(self, text: str) -> List[Dict[str, Any]]:
        """Extracts projects mentioned in the resume text."""
        projects = []
        lines = [line.strip() for line in text.split("\n") if line.strip()]

        # Heuristic project section detection
        in_projects = False
        current_project: Optional[Dict[str, Any]] = None

        for line in lines:
            line_lower = line.lower()
            if any(h in line_lower for h in ["projects", "academic projects", "key projects", "notable projects"]):
                in_projects = True
                continue
            if in_projects and any(h in line_lower for h in ["experience", "work history", "education", "certifications", "skills"]):
                in_projects = False
                if current_project:
                    projects.append(current_project)
                    current_project = None
                continue

            if in_projects:
                # New project header heuristic (e.g. line with title, dashes, or tech stack)
                if len(line) < 80 and not line.startswith("-") and not line.startswith("•") and not line.startswith("*"):
                    if current_project:
                        projects.append(current_project)
                    current_project = {
                        "title": line.split("|")[0].split("–")[0].split("-")[0].strip(),
                        "description": line,
                        "technologies": self.parse_skills_from_text(line)
                    }
                elif current_project:
                    current_project["description"] += " " + line
                    for s in self.parse_skills_from_text(line):
                        if s not in current_project["technologies"]:
                            current_project["technologies"].append(s)

        if current_project:
            projects.append(current_project)

        # Fallback if no specific section headers matched: find project-like lines
        if not projects:
            for line in lines:
                if any(k in line.lower() for k in ["developed", "engineered", "built", "implemented", "designed"]) and len(line) > 30:
                    skills_in_line = self.parse_skills_from_text(line)
                    if skills_in_line:
                        title_candidate = line.split(":")[0][:40] if ":" in line else f"Project ({skills_in_line[0]})"
                        projects.append({
                            "title": title_candidate.strip(),
                            "description": line,
                            "technologies": skills_in_line
                        })
                        if len(projects) >= 4:
                            break

        return projects[:6]

    def parse_experience_from_text(self, text: str) -> List[Dict[str, Any]]:
        """Extracts work experience or internships mentioned in the resume text."""
        experiences = []
        lines = [line.strip() for line in text.split("\n") if line.strip()]

        in_exp = False
        current_exp: Optional[Dict[str, Any]] = None

        for line in lines:
            line_lower = line.lower()
            if any(h in line_lower for h in ["experience", "work experience", "internships", "professional experience", "employment"]):
                in_exp = True
                continue
            if in_exp and any(h in line_lower for h in ["projects", "education", "certifications", "skills", "achievements"]):
                in_exp = False
                if current_exp:
                    experiences.append(current_exp)
                    current_exp = None
                continue

            if in_exp:
                if len(line) < 80 and not line.startswith("-") and not line.startswith("•") and not line.startswith("*"):
                    if current_exp:
                        experiences.append(current_exp)
                    current_exp = {
                        "title": line.split("|")[0].split("–")[0].split("-")[0].strip(),
                        "company": line.split("|")[-1].strip() if "|" in line else "Organization",
                        "description": line
                    }
                elif current_exp:
                    current_exp["description"] += " " + line

        if current_exp:
            experiences.append(current_exp)

        return experiences[:5]

    def parse_headline_and_summary(self, text: str) -> Tuple[str, str]:
        """Derives headline and summary from top lines."""
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        headline = ""
        summary = ""

        # First line might be name, second line might be headline/role
        if len(lines) > 1:
            second_line = lines[1]
            if len(second_line) < 80 and not any(c in second_line for c in ["@", "http", "phone", "+91"]):
                headline = second_line

        # Look for summary / profile / objective section
        for i, line in enumerate(lines[:25]):
            if any(w in line.lower() for w in ["summary", "profile", "objective", "about me"]):
                if i + 1 < len(lines):
                    summary = lines[i + 1]
                    if i + 2 < len(lines) and len(lines[i + 2]) > 20 and not lines[i + 2].startswith("#"):
                        summary += " " + lines[i + 2]
                break

        if not summary and lines:
            # First substantive paragraph under 300 chars
            for line in lines[1:8]:
                if len(line) > 50 and not any(c in line for c in ["@", "github", "linkedin", "phone", "+91"]):
                    summary = line
                    break

        return headline or "Aspiring Software Engineer", summary

    def parse_resume_bytes(self, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        End-to-end pipeline: validates, extracts text, and extracts structured sections.
        """
        ext = self.validate_file_metadata(filename, len(file_bytes))

        if ext == ".pdf":
            raw_text = self.extract_text_from_pdf(file_bytes)
        elif ext == ".docx":
            raw_text = self.extract_text_from_docx(file_bytes)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported format '{ext}'"
            )

        # Sanitize text
        clean_text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", raw_text)

        skills = self.parse_skills_from_text(clean_text)
        projects = self.parse_projects_from_text(clean_text)
        experience = self.parse_experience_from_text(clean_text)
        headline, summary = self.parse_headline_and_summary(clean_text)

        # Cap raw text to 12,000 chars for prompt safety
        safe_raw_text = clean_text[:12000]

        file_size_kb = round(len(file_bytes) / 1024, 1)
        file_size_formatted = f"{file_size_kb} KB" if file_size_kb < 1024 else f"{round(file_size_kb / 1024, 2)} MB"

        return {
            "filename": filename,
            "file_type": ext.lstrip("."),
            "file_size": len(file_bytes),
            "file_size_formatted": file_size_formatted,
            "headline": headline,
            "summary": summary,
            "skills": skills,
            "projects": projects,
            "experience": experience,
            "raw_text": safe_raw_text,
            "char_count": len(clean_text),
            "word_count": len(clean_text.split()),
        }


resume_parser_service = ResumeParserService()

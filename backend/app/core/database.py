import logging
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger("skillbridge.database")

# In-memory Mock Data Store for local development & offline testing
MOCK_DATA_STORE: Dict[str, List[Dict[str, Any]]] = {
    "institutions": [
        {
            "id": "a1000000-0000-0000-0000-000000000001",
            "name": "Indian Institute of Technology Delhi",
            "code": "IITD",
            "type": "iit_nit_iiit",
            "website": "https://home.iitd.ac.in",
            "city": "New Delhi",
            "state": "Delhi",
            "contact_email": "admin@iitd.ac.in",
            "verification_status": "verified",
            "is_active": True,
        },
        {
            "id": "a1000000-0000-0000-0000-000000000002",
            "name": "National Institute of Technology Karnataka",
            "code": "NITK",
            "type": "iit_nit_iiit",
            "website": "https://www.nitk.ac.in",
            "city": "Surathkal",
            "state": "Karnataka",
            "contact_email": "admin@nitk.edu.in",
            "verification_status": "verified",
            "is_active": True,
        },
        {
            "id": "a1000000-0000-0000-0000-000000000003",
            "name": "College of Engineering, Guindy",
            "code": "CEG-AU",
            "type": "autonomous_college",
            "website": "https://ceg.annauniv.edu",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "contact_email": "dean@ceg.annauniv.edu",
            "verification_status": "verified",
            "is_active": True,
        },
        {
            "id": "a1000000-0000-0000-0000-000000000004",
            "name": "Pune Institute of Computer Technology",
            "code": "PICT",
            "type": "affiliated_college",
            "website": "https://pict.edu",
            "city": "Pune",
            "state": "Maharashtra",
            "contact_email": "principal@pict.edu",
            "verification_status": "verified",
            "is_active": True,
        }
    ],
    "departments": [
        {"id": "b1000000-0000-0000-0000-000000000001", "institution_id": "a1000000-0000-0000-0000-000000000001", "name": "Computer Science and Engineering", "code": "CSE", "is_active": True},
        {"id": "b1000000-0000-0000-0000-000000000002", "institution_id": "a1000000-0000-0000-0000-000000000001", "name": "Electrical Engineering", "code": "EE", "is_active": True},
        {"id": "b1000000-0000-0000-0000-000000000003", "institution_id": "a1000000-0000-0000-0000-000000000001", "name": "Mechanical Engineering", "code": "MECH", "is_active": True},
        {"id": "b1000000-0000-0000-0000-000000000004", "institution_id": "a1000000-0000-0000-0000-000000000002", "name": "Information Technology", "code": "IT", "is_active": True},
        {"id": "b1000000-0000-0000-0000-000000000005", "institution_id": "a1000000-0000-0000-0000-000000000002", "name": "Computer Science and Engineering", "code": "CSE", "is_active": True},
        {"id": "b1000000-0000-0000-0000-000000000006", "institution_id": "a1000000-0000-0000-0000-000000000002", "name": "Electronics & Communication", "code": "ECE", "is_active": True},
    ],
    "companies": [
        {"id": "c1000000-0000-0000-0000-000000000001", "name": "Tata Consultancy Services", "industry_sector": "IT & Consulting", "verification_status": "verified", "is_active": True},
        {"id": "c1000000-0000-0000-0000-000000000002", "name": "Infosys Limited", "industry_sector": "IT Services", "verification_status": "verified", "is_active": True}
    ],
    "profiles": [
        {
            "id": "u1000000-0000-0000-0000-000000000001",
            "email": "student@iitd.ac.in",
            "full_name": "Aarav Sharma",
            "phone": "+91 9876543210",
            "role": "student",
            "institution_id": "a1000000-0000-0000-0000-000000000001",
            "department_id": "b1000000-0000-0000-0000-000000000001",
            "company_id": None,
            "verification_status": "verified",
            "is_active": True,
        },
        {
            "id": "u1000000-0000-0000-0000-000000000002",
            "email": "faculty@iitd.ac.in",
            "full_name": "Dr. Priya Deshmukh",
            "phone": "+91 9876543211",
            "role": "academician",
            "institution_id": "a1000000-0000-0000-0000-000000000001",
            "department_id": "b1000000-0000-0000-0000-000000000001",
            "company_id": None,
            "verification_status": "verified",
            "is_active": True,
        },
        {
            "id": "u1000000-0000-0000-0000-000000000003",
            "email": "hr@tcs.com",
            "full_name": "Vikram Malhotra",
            "phone": "+91 9876543212",
            "role": "industry_hr",
            "institution_id": None,
            "department_id": None,
            "company_id": "c1000000-0000-0000-0000-000000000001",
            "verification_status": "verified",
            "is_active": True,
        },
        {
            "id": "u1000000-0000-0000-0000-000000000004",
            "email": "admin@iitd.ac.in",
            "full_name": "IITD Principal / Dean",
            "phone": "+91 9876543213",
            "role": "institution_admin",
            "institution_id": "a1000000-0000-0000-0000-000000000001",
            "department_id": None,
            "company_id": None,
            "verification_status": "verified",
            "is_active": True,
        },
        {
            "id": "u1000000-0000-0000-0000-000000000005",
            "email": "superadmin@skillbridge.gov.in",
            "full_name": "Platform Super Admin",
            "phone": "+91 9876543214",
            "role": "super_admin",
            "institution_id": None,
            "department_id": None,
            "company_id": None,
            "verification_status": "verified",
            "is_active": True,
        }
    ]
}

class SupabaseManager:
    def __init__(self):
        self._client: Optional[Client] = None
        self._is_live = False
        self._init_client()

    def _init_client(self):
        # Initialize Supabase client if we have a URL **and** at least one secret key.
        # Prefer the service‑role key for full read/write capabilities; otherwise use the anon key (read‑only).
        if (
            settings.SUPABASE_URL
            and not settings.SUPABASE_URL.startswith("https://demo-placeholder")
            and (settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY)
        ):
            try:
                # Choose the appropriate secret without logging its value.
                secret = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
                key_type = "service‑role" if settings.SUPABASE_SERVICE_ROLE_KEY else "anon"
                self._client = create_client(settings.SUPABASE_URL, secret)
                self._is_live = True
                logger.info(f"Connected to live Supabase backend using {key_type} key.")
            except Exception as e:
                logger.warning(f"Could not connect to live Supabase: {e}. Falling back to dev store.")
                self._is_live = False
        else:
            logger.info("Running in local development / offline foundation mode (no Supabase key provided).")
            self._is_live = False

    @property
    def is_live(self) -> bool:
        return self._is_live

    @property
    def client(self) -> Optional[Client]:
        return self._client

db_manager = SupabaseManager()

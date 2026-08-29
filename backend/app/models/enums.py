from enum import Enum

class UserRole(str, Enum):
    STUDENT = "student"
    ACADEMICIAN = "academician"
    INDUSTRY_HR = "industry_hr"
    INSTITUTION_ADMIN = "institution_admin"
    SUPER_ADMIN = "super_admin"

class InstitutionType(str, Enum):
    UNIVERSITY = "university"
    AUTONOMOUS_COLLEGE = "autonomous_college"
    AFFILIATED_COLLEGE = "affiliated_college"
    POLYTECHNIC = "polytechnic"
    IIT_NIT_IIIT = "iit_nit_iiit"
    OTHER = "other"

class VerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    SUSPENDED = "suspended"

class AcademicianRoleLevel(str, Enum):
    FACULTY = "faculty"
    HOD = "hod"
    DEAN = "dean"
    PLACEMENT_COORDINATOR = "placement_coordinator"

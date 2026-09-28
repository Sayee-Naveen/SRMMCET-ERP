import os
from sqlalchemy.orm import sessionmaker
from app.database import engine, Base
from app.models import (
    ActivityCategory, ModuleStudent, ModuleFaculty,
    ExtraCurricularActivity, ActivityCertificate
)
from datetime import datetime

def seed():
    # Re-create tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    print("[SEED:ExtraCurricular] Rebuilding database without points / verification...")

    # 1. Categories
    categories = [
        ActivityCategory(category_code="SPORTS", display_name="Sports & Athletics", description="Track, field, indoor and outdoor athletic events", icon_name="Trophy", badge_color="amber", display_order=1),
        ActivityCategory(category_code="CULTURAL", display_name="Cultural & Arts", description="Theatrics, skits, fest performances and arts", icon_name="Sparkles", badge_color="purple", display_order=2),
        ActivityCategory(category_code="CLUBS", display_name="Student Clubs & Chapters", description="Technical, professional and social student clubs", icon_name="Users", badge_color="blue", display_order=3),
        ActivityCategory(category_code="NSS_NCC", display_name="NSS & NCC", description="National Cadet Corps and National Service Scheme", icon_name="Shield", badge_color="emerald", display_order=4),
        ActivityCategory(category_code="MUSIC", display_name="Music & Band", description="Vocal, instrumental and orchestra competitions", icon_name="Music", badge_color="rose", display_order=5),
        ActivityCategory(category_code="DANCE", display_name="Dance", description="Classical, folk and western dance performances", icon_name="Flame", badge_color="orange", display_order=6),
        ActivityCategory(category_code="LITERARY", display_name="Literary & Debating", description="Debates, elocution, quiz and MUN conferences", icon_name="BookOpen", badge_color="cyan", display_order=7),
        ActivityCategory(category_code="SOCIAL_SERVICE", display_name="Social Service", description="Blood donation, community drives and village outreach", icon_name="Heart", badge_color="red", display_order=8),
    ]
    db.add_all(categories)
    db.commit()

    # 2. Demo Users
    users = [
        ModuleFaculty(username="admin", password="admin123", full_name="ERP Administrator", department="Academic & Student Affairs", role="admin"),
        ModuleFaculty(username="prof.kumar", password="kumar123", full_name="Dr. R. Kumar", department="Computer Science & Engineering", role="faculty"),
        ModuleFaculty(username="prof.meena", password="meena123", full_name="Dr. S. Meena", department="Information Technology", role="faculty"),
    ]
    db.add_all(users)
    db.commit()

    # 3. Students
    students = [
        ModuleStudent(reg_no="911124104001", name="Arjun R", department="CSE", degree="B.E.", batch_year=2024, regulation="R2021", current_sem=2, section="A"),
        ModuleStudent(reg_no="911124104002", name="Priya S", department="CSE", degree="B.E.", batch_year=2024, regulation="R2021", current_sem=2, section="A"),
        ModuleStudent(reg_no="911125104001", name="Suresh M", department="CSE", degree="B.E.", batch_year=2025, regulation="R2025", current_sem=1, section="A"),
        ModuleStudent(reg_no="911124205001", name="Karthik M", department="IT", degree="B.Tech", batch_year=2024, regulation="R2021", current_sem=2, section="A"),
        ModuleStudent(reg_no="911124104005", name="Deepa V", department="CSE", degree="B.E.", batch_year=2024, regulation="R2021", current_sem=2, section="A"),
        ModuleStudent(reg_no="911124205008", name="Vignesh K", department="IT", degree="B.Tech", batch_year=2024, regulation="R2021", current_sem=2, section="B")
    ]
    db.add_all(students)
    db.commit()

    # 4. Activities across domains with selective regulations
    acts = [
        ExtraCurricularActivity(
            reg_no="911124104001",
            regulation="R2021",
            category="Sports",
            sub_category="Athletics (400m Dash)",
            title="Anna University Zonal Athletics Championship",
            organizer="Anna University Sports Board Zone-16",
            level="Zonal",
            role="Participant",
            achievement="1st Place (Gold)",
            event_date="2024-11-14",
            academic_year="2024-2025",
            semester=1,
            description="Clinched 1st place gold medal in 400m sprint clocking 49.8s at Zone-16 athletic meet."
        ),
        ExtraCurricularActivity(
            reg_no="911124104002",
            regulation="R2021",
            category="Sports",
            sub_category="Badminton (Singles)",
            title="State Level Inter-Engineering Badminton Tournament",
            organizer="TCE Madurai",
            level="State Level",
            role="Winner",
            achievement="Winner (Gold)",
            event_date="2025-01-22",
            academic_year="2024-2025",
            semester=2,
            description="Undefeated run throughout tournament defeating PSG Tech in the finals (21-18, 21-16)."
        ),
        ExtraCurricularActivity(
            reg_no="911124205001",
            regulation="R2021",
            category="Cultural",
            sub_category="Theatrics & Skit",
            title="SRM FEST '25 Annual Cultural Extravaganza",
            organizer="SRM Madurai College for Engineering & Technology",
            level="College Fest",
            role="Lead Actor",
            achievement="1st Prize",
            event_date="2025-02-15",
            academic_year="2024-2025",
            semester=2,
            description="Lead performance in satirical stage play 'Digital Samsara', adjudged Best Dramatic Play."
        ),
        ExtraCurricularActivity(
            reg_no="911124104001",
            regulation="R2021",
            category="Clubs",
            sub_category="Robotics & Automation Society",
            title="SRMMCET Robotics Society - Student Leadership",
            organizer="Department of CSE & Student Affairs",
            level="College Chapter",
            role="President",
            achievement="Outstanding Leadership",
            event_date="2024-09-05",
            academic_year="2024-2025",
            semester=1,
            description="Organized 3 multi-college hands-on drone workshops and mentored 120+ first year students."
        ),
        ExtraCurricularActivity(
            reg_no="911125104001",
            regulation="R2025",
            category="Clubs",
            sub_category="SRM Coding & Algorithmic Club",
            title="National 36-Hour Hackathon - InnovateX",
            organizer="IIT Madras Shaastra",
            level="National Chapter",
            role="Event Coordinator",
            achievement="Project Showcase Winner",
            event_date="2025-01-08",
            academic_year="2024-2025",
            semester=1,
            description="Built automated assistive learning device for visually impaired; won 2nd track prize."
        ),
        ExtraCurricularActivity(
            reg_no="911124104005",
            regulation="R2021",
            category="NSS/NCC",
            sub_category="NSS 7-Day Rural Special Camp",
            title="National Service Scheme Special Village Camp - Melur",
            organizer="NSS Cell SRMMCET & Anna University",
            level="Unit Level",
            role="Camp Leader",
            achievement="Camp Completion Certificate",
            event_date="2024-12-18",
            academic_year="2024-2025",
            semester=1,
            description="Spearheaded lake desiltation, solar streetlight installation awareness, and medical checkup camps."
        ),
        ExtraCurricularActivity(
            reg_no="911124205001",
            regulation="R2021",
            category="NSS/NCC",
            sub_category="NCC Annual Training Camp (ATC)",
            title="Combined Annual Training Camp (CATC-2024)",
            organizer="4(TN) Battalion NCC Madurai",
            level="Battalion / Camp Level",
            role="Senior Under Officer (SUO)",
            achievement="Best Cadet Award",
            event_date="2024-10-10",
            academic_year="2024-2025",
            semester=1,
            description="Commanded the ceremonial battalion drill contingent and secured gold in .22 rifle shooting."
        ),
        ExtraCurricularActivity(
            reg_no="911124205008",
            regulation="R2021",
            category="Music",
            sub_category="College Fusion Band",
            title="South India Inter-University Music Festival 'Symphonia'",
            organizer="NIT Trichy Festember",
            level="Inter-Collegiate Fest",
            role="Lead Guitarist",
            achievement="2nd Prize (Silver)",
            event_date="2024-10-02",
            academic_year="2024-2025",
            semester=1,
            description="Performed classical-rock fusion composition 'Kalyani Groove' amidst 40 participating college bands."
        ),
        ExtraCurricularActivity(
            reg_no="911124104002",
            regulation="R2021",
            category="Dance",
            sub_category="Classical Solo (Bharatanatyam)",
            title="Tamil Nadu State Level Classical Dance Conclave",
            organizer="Tamil Nadu Eyal Isai Nataka Manram",
            level="State Dance Competition",
            role="Solo Dancer",
            achievement="1st Prize",
            event_date="2025-01-16",
            academic_year="2024-2025",
            semester=2,
            description="Varnam performance in Ragam Natakurinji; felicitated by renowned artists for technical precision."
        ),
        ExtraCurricularActivity(
            reg_no="911125104001",
            regulation="R2025",
            category="Literary",
            sub_category="English Debate (Parliamentary)",
            title="Anna University Inter-Collegiate Parliamentary Debate",
            organizer="Anna University Debating Society Chennai",
            level="State Level",
            role="Debater / Speaker",
            achievement="1st Place (Winner)",
            event_date="2025-02-04",
            academic_year="2024-2025",
            semester=1,
            description="Argued on the motion regarding AI in Academic Governance, securing Best Speaker and Team Winner."
        ),
        ExtraCurricularActivity(
            reg_no="911124104005",
            regulation="R2021",
            category="Social Service",
            sub_category="Mega Voluntary Blood Donation Camp",
            title="Red Cross Blood Donation & Health Camp",
            organizer="Indian Red Cross Society & Government Rajaji Hospital Madurai",
            level="Campus",
            role="Student Coordinator",
            achievement="Star Donor Citation",
            event_date="2024-11-08",
            academic_year="2024-2025",
            semester=1,
            description="Organized camp collecting 340+ units of blood and personally donated unit of O-ve blood."
        )
    ]

    db.add_all(acts)
    db.commit()

    # 5. Certificates uploaded / attached
    certs = [
        ActivityCertificate(
            activity_id=acts[0].id,
            certificate_no="SRM-SP-2024-ZON-0041",
            title="Certificate of Merit - 400m Athletics Gold",
            issuing_authority="Anna University Sports Board Zone-16",
            issue_date="2024-11-14"
        ),
        ActivityCertificate(
            activity_id=acts[1].id,
            certificate_no="SRM-SP-2025-BAD-0112",
            title="State Level Badminton Championship Citation",
            issuing_authority="Thiagarajar College of Engineering Madurai",
            issue_date="2025-01-22"
        ),
        ActivityCertificate(
            activity_id=acts[2].id,
            certificate_no="SRM-CL-2025-DRM-0089",
            title="Best Performer Award - SRM FEST Culturals",
            issuing_authority="SRM MCET Cultural Committee",
            issue_date="2025-02-15"
        ),
        ActivityCertificate(
            activity_id=acts[5].id,
            certificate_no="SRM-NSS-2024-CMP-0320",
            title="NSS Special Village Camp Service Certificate",
            issuing_authority="Anna University NSS Cell Chennai",
            issue_date="2024-12-18"
        ),
        ActivityCertificate(
            activity_id=acts[8].id,
            certificate_no="SRM-DN-2025-BHA-0077",
            title="State Classical Dance Championship Award",
            issuing_authority="Tamil Nadu Eyal Isai Nataka Manram",
            issue_date="2025-01-16"
        ),
        ActivityCertificate(
            activity_id=acts[9].id,
            certificate_no="SRM-LT-2025-DEB-0211",
            title="Winner & Best Speaker - Parliamentary Debate",
            issuing_authority="Anna University Debating Society",
            issue_date="2025-02-04"
        ),
        ActivityCertificate(
            activity_id=acts[10].id,
            certificate_no="SRM-SS-2024-BLD-0655",
            title="Indian Red Cross Star Donor & Coordinator Honor",
            issuing_authority="Indian Red Cross Society & GRH Madurai",
            issue_date="2024-11-08"
        )
    ]
    db.add_all(certs)
    db.commit()
    db.close()
    print("[SEED:ExtraCurricular] All data successfully rebuilt with selective regulation and no points/verification!")

if __name__ == "__main__":
    seed()

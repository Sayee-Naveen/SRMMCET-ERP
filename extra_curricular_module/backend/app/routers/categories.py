from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models import ActivityCategory
from ..schemas import CategoryOut

router = APIRouter(prefix="/api/categories", tags=["Categories"])

PRESET_DOMAINS = {
    "Sports": {
        "events": [
            "Athletics (100m, 200m, 400m, 4x100m Relay)",
            "Cricket",
            "Football",
            "Badminton (Singles / Doubles)",
            "Volleyball",
            "Basketball",
            "Table Tennis",
            "Chess",
            "Kabaddi",
            "Kho-Kho",
            "Ball Badminton",
            "Archery"
        ],
        "roles": ["Participant", "Winner", "Runner-Up", "Team Captain", "Vice-Captain", "Squad Member"],
        "achievements": ["1st Place (Gold)", "2nd Place (Silver)", "3rd Place (Bronze)", "Winner", "Runner-Up", "Semi-Finalist", "Quarter-Finalist", "Participant"],
        "levels": ["Department", "College Annual Sports", "Anna University Zonal", "Inter-Zonal", "State Level", "All India Inter-University", "National"]
    },
    "Cultural": {
        "events": [
            "Annual Cultural Fest (SRM FEST)",
            "Inter-Collegiate Cultural Carnival",
            "Theatrics & Skit",
            "Mime & Street Play",
            "Fashion & Traditional Attire Walk",
            "Standup Comedy",
            "Short Film & Photography"
        ],
        "roles": ["Performer", "Lead Actor", "Director", "Event Coordinator", "Participant", "Winner"],
        "achievements": ["1st Prize", "2nd Prize", "3rd Prize", "Best Performer", "Special Jury Award", "Participation"],
        "levels": ["College Fest", "Inter-Collegiate", "State Level Fest", "National Fest"]
    },
    "Clubs": {
        "events": [
            "SRM Coding & Algorithmic Club",
            "Robotics & Automation Society",
            "AI & Data Science Student Chapter",
            "Rotaract Club of SRMMCET",
            "Toastmasters International Club",
            "Entrepreneurship Development Cell (EDC)",
            "Eco & Nature Conservation Club",
            "Photography & Media Guild",
            "Design & UI/UX Society"
        ],
        "roles": ["President", "Vice President", "Secretary", "Treasurer", "Technical Lead", "Event Coordinator", "Active Member"],
        "achievements": ["Outstanding Leadership", "Best Club Coordinator", "Active Contribution", "Completed Tenure", "Project Showcase Winner"],
        "levels": ["College Chapter", "Inter-College Chapter", "District / Regional", "National Chapter"]
    },
    "NSS/NCC": {
        "events": [
            "NSS 7-Day Rural Special Camp",
            "Swachh Bharat Cleanliness Mission",
            "NSS Annual Regular Activities",
            "NCC Annual Training Camp (ATC)",
            "NCC Combined Annual Training Camp (CATC)",
            "Republic Day Parade (RDC) Contingent",
            "Thal Sainik Camp (TSC)",
            "NCC National Integration Camp (NIC)"
        ],
        "roles": ["Cadet", "Senior Under Officer (SUO)", "Junior Under Officer (JUO)", "Sergeant", "Corporal", "NSS Volunteer", "Camp Leader"],
        "achievements": ["Camp Completion Certificate", "Best Cadet Award", "Outstanding NSS Volunteer", "RDC Medal", "Governor's Commendation", "Completed"],
        "levels": ["Unit Level", "Battalion / Camp Level", "Group Level", "Directorate / State", "National"]
    },
    "Music": {
        "events": [
            "Carnatic Classical Vocal Solo",
            "Western Vocal Solo",
            "Light Music / Film Song Vocal",
            "Instrumental - Keyboard / Piano",
            "Instrumental - Violin / Flute",
            "Instrumental - Guitar / Bass",
            "Percussion - Mridangam / Drums",
            "College Fusion Band"
        ],
        "roles": ["Solo Vocalist", "Lead Guitarist", "Keyboardist", "Percussionist", "Band Member", "Accompanist"],
        "achievements": ["1st Prize (Gold)", "2nd Prize (Silver)", "3rd Prize (Bronze)", "Best Instrumentalist", "Best Band", "Participation"],
        "levels": ["College", "Inter-Collegiate Fest", "University Level", "State Level", "National"]
    },
    "Dance": {
        "events": [
            "Classical Solo (Bharatanatyam / Kathak)",
            "Classical Group Dance",
            "Western Dance Solo",
            "Western Hip-Hop / Freestyle Group",
            "Folk Dance (Karagattam / Oyilattam / Kavadi)",
            "Contemporary & Lyrical Dance"
        ],
        "roles": ["Solo Dancer", "Group Lead Choreographer", "Ensemble Performer", "Participant"],
        "achievements": ["1st Prize", "2nd Prize", "3rd Prize", "Best Choreography", "Special Jury Award", "Participation"],
        "levels": ["College Annual Day", "Inter-Collegiate Culturals", "State Dance Competition", "National Championship"]
    },
    "Literary": {
        "events": [
            "English Debate (Parliamentary / Oxford)",
            "Tamil Debate (Pattimandram / Arangam)",
            "English & Tamil Elocution",
            "General & Tech Quiz",
            "Creative Essay Writing",
            "Poetry Recitation & Slam",
            "Model United Nations (MUN)",
            "Spell Bee & Word Power"
        ],
        "roles": ["Debater / Speaker", "Quizzer", "Writer / Poet", "Delegate (MUN)", "Participant"],
        "achievements": ["1st Place (Winner)", "2nd Place (Runner-up)", "3rd Place", "Best Speaker / Debater", "Best Delegate", "Participation"],
        "levels": ["Department", "College", "Inter-Collegiate", "State Level", "National MUN"]
    },
    "Social Service": {
        "events": [
            "Mega Voluntary Blood Donation Camp",
            "Tree Plantation & Green Campus Drive",
            "Village Literacy & Digital Awareness Outreach",
            "Orphanage & Elderly Home Care Visit",
            "Disaster Relief & Aid Distribution",
            "Traffic Awareness & Road Safety Campaign",
            "Health & Hygiene Awareness Drive"
        ],
        "roles": ["Student Coordinator", "Donor & Volunteer", "Team Lead", "Field Campaigner"],
        "achievements": ["Certificate of Appreciation", "Star Donor Citation", "Outstanding Social Volunteer", "Community Impact Recognition", "Completed"],
        "levels": ["Campus", "Local Community / Madurai District", "State Outreach", "National Mission"]
    }
}

@router.get("", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    cats = db.query(ActivityCategory).order_by(ActivityCategory.display_order.asc()).all()
    return cats

@router.get("/domains-meta")
def get_domains_metadata():
    return PRESET_DOMAINS

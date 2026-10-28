
import logging
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from .resume_analyzer import (
    analyze_resume_text,
    analyze_resume_skill_gaps,
    generate_career_roadmap,
)
from .resume_parser import extract_resume_text
from .schemas import (
    ResumeAnalysisResponse,
    SkillGapAnalysisResponse,
    CareerRoadmapResponse,
)

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".jpg", ".jpeg"}

app = FastAPI(
    title="AKHI AI Service",
    description="AI-powered career companion API",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "akhi-ai"}


# --------------------------------------------------
# Shared Resume Validation and Text Extraction
# --------------------------------------------------

async def get_resume_text(file: UploadFile) -> str:
    filename = file.filename or ""
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail="Only PDF, DOCX, JPG, and JPEG files are supported.",
        )

    try:
        content = await file.read(MAX_FILE_SIZE + 1)
    finally:
        await file.close()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size must not exceed 5 MB.",
        )

    if extension == ".pdf" and not content.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file does not appear to be a valid PDF.",
        )

    if extension == ".docx" and not content.startswith(b"PK"):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file does not appear to be a valid DOCX.",
        )

    if extension in {".jpg", ".jpeg"}:
        if not content.startswith(b"\xff\xd8\xff"):
            raise HTTPException(
                status_code=400,
                detail="The uploaded file does not appear to be a valid JPEG image.",
            )

    try:
        return await run_in_threadpool(
            extract_resume_text,
            content,
            extension,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
    except Exception:
        logger.exception("Resume text extraction failed")
        raise HTTPException(
            status_code=500,
            detail="Resume processing failed. Please try another file.",
        ) from None


# --------------------------------------------------
# Resume Analysis
# --------------------------------------------------

@app.post(
    "/api/v1/resume/analyze",
    response_model=ResumeAnalysisResponse,
)
async def analyze_resume(file: UploadFile = File(...)):
    resume_text = await get_resume_text(file)

    try:
        return await run_in_threadpool(
            analyze_resume_text,
            resume_text,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
    except Exception:
        logger.exception("AI resume analysis failed")
        raise HTTPException(
            status_code=502,
            detail="AI resume analysis failed. Please try again.",
        ) from None


# --------------------------------------------------
# Resume Skill Gap Analysis
# --------------------------------------------------

@app.post(
    "/api/v1/resume/skill-gap",
    response_model=SkillGapAnalysisResponse,
)
async def analyze_resume_skill_gap(file: UploadFile = File(...)):
    resume_text = await get_resume_text(file)

    try:
        return await run_in_threadpool(
            analyze_resume_skill_gaps,
            resume_text,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
    except Exception:
        logger.exception("Resume skill-gap analysis failed")
        raise HTTPException(
            status_code=502,
            detail="Skill-gap analysis failed. Please try again.",
        ) from None


# --------------------------------------------------
# Career Roadmap Form Request
# --------------------------------------------------

class CareerRoadmapRequest(BaseModel):
    target_role: str = Field(min_length=1, max_length=100)

    current_level: Literal[
        "Beginner",
        "Intermediate",
        "Advanced",
    ]

    current_skills: list[str] = Field(
        default_factory=list,
        max_length=50,
    )

    skills_not_provided: bool = False

    experience: str = Field(
        min_length=1,
        max_length=100,
    )

    goal: str = Field(
        min_length=1,
        max_length=150,
    )

    weekly_study_hours: int = Field(
        ge=1,
        le=60,
    )

    deadline: str = Field(
        min_length=1,
        max_length=50,
    )

    learning_preference: str = Field(
        min_length=1,
        max_length=100,
    )


# --------------------------------------------------
# Career Roadmap Generation
# --------------------------------------------------

@app.post(
    "/api/v1/career/roadmap",
    response_model=CareerRoadmapResponse,
)
async def create_career_roadmap(
    request: CareerRoadmapRequest,
):
    # Do not silently invent the user's current skills.
    if request.skills_not_provided and request.current_skills:
        raise HTTPException(
            status_code=422,
            detail=(
                "Provide current skills or mark skills as not "
                "provided, not both."
            ),
        )

    if not request.skills_not_provided and not request.current_skills:
        raise HTTPException(
            status_code=422,
            detail=(
                "Add your current skills or mark them as not provided."
            ),
        )

    # The roadmap does not require a resume upload.
    try:
        return await run_in_threadpool(
            generate_career_roadmap,
            target_role=request.target_role,
            current_level=request.current_level,
            current_skills=request.current_skills,
            skills_not_provided=request.skills_not_provided,
            experience=request.experience,
            goal=request.goal,
            weekly_study_hours=request.weekly_study_hours,
            deadline=request.deadline,
            learning_preference=request.learning_preference,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
    except Exception:
        logger.exception("Career roadmap generation failed")
        raise HTTPException(
            status_code=502,
            detail=(
                "Career roadmap generation failed. Please try again."
            ),
        ) from None

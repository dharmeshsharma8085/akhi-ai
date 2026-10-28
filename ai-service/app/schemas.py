
from typing import Literal

from pydantic import BaseModel, Field, field_validator


# --------------------------------------------------
# Resume Analysis Schemas
# --------------------------------------------------

class SkillEvidence(BaseModel):
    name: str
    evidence: str
    confidence: float = Field(ge=0.0, le=1.0)


class ExperienceSummary(BaseModel):
    role: str
    description: str
    source: Literal["resume"]


class PotentialSkillGap(BaseModel):
    skill: str
    reason: str
    priority: Literal["low", "medium", "high"]


class ResumeAnalysisResponse(BaseModel):
    status: Literal["success", "error"]
    resume_summary: str
    skills: list[SkillEvidence]
    experience_summary: list[ExperienceSummary]
    potential_skill_gaps: list[PotentialSkillGap]
    recommended_next_steps: list[str]
    disclaimer: str


# --------------------------------------------------
# Resume Skill Gap Analysis Schemas
# --------------------------------------------------

class SkillGapItem(BaseModel):
    skill: str
    status: Literal[
        "demonstrated",
        "partially_demonstrated",
        "not_demonstrated",
    ]
    evidence: str
    priority: Literal["low", "medium", "high"]
    recommendation: str


class SkillGapAnalysisResponse(BaseModel):
    status: Literal["success", "error"]
    target_role: str
    matching_skills: list[str]
    skill_gaps: list[SkillGapItem]
    recommended_next_steps: list[str]
    disclaimer: str


# --------------------------------------------------
# Career Roadmap Schemas
# --------------------------------------------------

class RoadmapMilestone(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    tasks: list[str] = Field(min_length=1, max_length=20)
    deliverable: str = Field(min_length=1, max_length=500)
    estimated_hours: int = Field(ge=1, le=500)


class RoadmapPhase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    duration_weeks: int = Field(ge=1, le=104)
    objective: str = Field(min_length=1, max_length=1000)
    milestones: list[RoadmapMilestone] = Field(
        min_length=1,
        max_length=20,
    )


class CareerRoadmapResponse(BaseModel):
    status: Literal["success", "error"]
    target_role: str = Field(min_length=1, max_length=100)
    starting_point: str = Field(min_length=1, max_length=2000)
    total_duration_weeks: int = Field(ge=1, le=104)
    phases: list[RoadmapPhase] = Field(min_length=1, max_length=10)
    recommended_next_steps: list[str] = Field(
        min_length=1,
        max_length=20,
    )
    disclaimer: str = Field(min_length=1, max_length=2000)

    @field_validator("phases")
    @classmethod
    def validate_phase_durations(
        cls,
        phases: list[RoadmapPhase],
    ) -> list[RoadmapPhase]:
        if not phases:
            raise ValueError("A roadmap must contain at least one phase.")

        return phases

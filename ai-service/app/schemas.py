
from typing import Literal

from pydantic import BaseModel, Field


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

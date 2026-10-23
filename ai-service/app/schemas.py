
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


class SkillGapItem(BaseModel):
    skill: str
    status: Literal[
        "demonstrated",
        "partially_demonstrated",
        "not_demonstrated"
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

import logging
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool

from .resume_analyzer import analyze_resume_text
from .resume_parser import extract_resume_text
from .schemas import ResumeAnalysisResponse


load_dotenv(Path(__file__).resolve().parents[1] / ".env")

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".jpg", ".jpeg"}

app = FastAPI(
    title="AKHI AI Service",
    description="AI-powered career companion API",
    version="0.1.0",
)

# Allow the Vite development ports used by the AKHI AI frontend.
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


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "akhi-ai"}


@app.post(
    "/api/v1/resume/analyze",
    response_model=ResumeAnalysisResponse,
)
async def analyze_resume(file: UploadFile = File(...)):
    filename = file.filename or ""
    extension = Path(filename).suffix.lower()

    # 1. Validate file extension
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail="Only PDF, DOCX, JPG, and JPEG files are supported.",
        )

    # 2. Read the file with a size limit
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

    # 3. Basic file-signature validation
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

    # 4. Extract text from the resume
    try:
        resume_text = await run_in_threadpool(
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

    # 5. Run AI analysis on the extracted text
    try:
        analysis = await run_in_threadpool(
            analyze_resume_text,
            resume_text,
        )
        return analysis
    except Exception:
        logger.exception("AI resume analysis failed")
        raise HTTPException(
            status_code=502,
            detail="AI resume analysis failed. Please try again.",
        ) from None

"""Generate the Dutch and English one-page CV PDFs.

Run from the repository root:
    python -m pip install -r requirements-pdf.txt
    python scripts/generate_cv_pdfs.py
"""

from __future__ import annotations

import json
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfdoc import PDFString
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "pdf"
FONT_DIR = ROOT / "assets" / "fonts"
PROFILE_IMAGE = ROOT / "img" / "profile.png"

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 42
PRIMARY = HexColor("#556BC2")
ACCENT = HexColor("#AE8AA9")
TEXT = HexColor("#0F1116")
MUTED = HexColor("#5E6472")
PANEL = HexColor("#F5F3F8")
LINE = HexColor("#DDD9E5")

REGULAR = "Alexandria"
SEMIBOLD = "Alexandria-SemiBold"


LOCALES = {
    "nl": {
        "data_dir": ROOT / "data",
        "output": OUTPUT_DIR / "maurits-fokkens-cv-nl.pdf",
        "language": "nl-NL",
        "job_title": "Softwareontwikkelaar",
        "sections": {
            "experience": "Ervaring",
            "education": "Opleiding",
            "technology": "Technologieën",
            "competencies": "Competenties",
        },
        "current": "heden",
        "subject": "Beknopt Nederlandstalig cv van Maurits Fokkens",
    },
    "en": {
        "data_dir": ROOT / "data-en",
        "output": OUTPUT_DIR / "maurits-fokkens-cv-en.pdf",
        "language": "en-GB",
        "job_title": "Software Developer",
        "sections": {
            "experience": "Experience",
            "education": "Education",
            "technology": "Technologies",
            "competencies": "Competencies",
        },
        "current": "Present",
        "subject": "Concise English CV of Maurits Fokkens",
    },
}


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as stream:
        return json.load(stream)


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont(REGULAR, FONT_DIR / "Alexandria-Regular.ttf"))
    pdfmetrics.registerFont(TTFont(SEMIBOLD, FONT_DIR / "Alexandria-SemiBold.ttf"))


def paragraph_style(
    name: str,
    *,
    size: float,
    leading: float,
    color=TEXT,
    font: str = REGULAR,
    space_after: float = 0,
) -> ParagraphStyle:
    return ParagraphStyle(
        name,
        fontName=font,
        fontSize=size,
        leading=leading,
        textColor=color,
        alignment=TA_LEFT,
        spaceAfter=space_after,
        allowWidows=0,
        allowOrphans=0,
    )


STYLES = {
    "summary": paragraph_style("Summary", size=9, leading=12.5, color=MUTED),
    "role": paragraph_style("Role", size=9.6, leading=11.8, font=SEMIBOLD),
    "dates": paragraph_style("Dates", size=7.8, leading=9.5, color=PRIMARY, font=SEMIBOLD),
    "body": paragraph_style("Body", size=8.5, leading=11.8, color=MUTED),
    "education": paragraph_style("Education", size=8, leading=10.6),
    "small": paragraph_style("Small", size=7.1, leading=9.5, color=MUTED),
    "skill_line": paragraph_style("SkillLine", size=7.1, leading=9.5, color=PRIMARY, font=SEMIBOLD),
}


def draw_paragraph(c: canvas.Canvas, text: str, style: ParagraphStyle, x: float, y: float, width: float) -> float:
    paragraph = Paragraph(text, style)
    _, height = paragraph.wrap(width, PAGE_HEIGHT)
    paragraph.drawOn(c, x, y - height)
    return y - height


def draw_section_title(c: canvas.Canvas, title: str, x: float, y: float, width: float) -> float:
    c.setFillColor(PRIMARY)
    c.roundRect(x, y - 11, 3, 11, 1.5, fill=1, stroke=0)
    c.setFillColor(TEXT)
    c.setFont(SEMIBOLD, 10.5)
    c.drawString(x + 9, y - 9, title.upper())
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(x, y - 16, x + width, y - 16)
    return y - 25


def rounded_portrait() -> ImageReader:
    with Image.open(PROFILE_IMAGE) as image:
        portrait = ImageOps.fit(image.convert("RGB"), (600, 600), method=Image.Resampling.LANCZOS, centering=(0.5, 0.25))
        mask = Image.new("L", portrait.size, 0)
        from PIL import ImageDraw

        ImageDraw.Draw(mask).rounded_rectangle((0, 0, 599, 599), radius=120, fill=255)
        portrait.putalpha(mask)
        buffer = BytesIO()
        portrait.save(buffer, format="PNG", optimize=True)
    buffer.seek(0)
    return ImageReader(buffer)


def summary_from_about(about_text: str) -> str:
    paragraphs = [part.strip() for part in about_text.split("\n\n") if part.strip()]
    return " ".join(paragraphs[:2])


def experience_items(experience: list[dict], locale_config: dict) -> list[dict]:
    by_id = {item["id"]: item for item in experience}
    items = []
    for item_id in (9, 8, 7, 6):
        source = by_id[item_id]
        company = "Albert Heijn Labs" if item_id in {8, 9} else source["company"]
        items.append(
            {
                "company": company,
                "role": source.get("role", ""),
                "dates": f'{source["startDate"]} - {source["endDate"]}',
                "description": source["description"],
                "skills": list(source.get("skills", {})),
            }
        )
    return items


def draw_experience(c: canvas.Canvas, items: list[dict], x: float, y: float, width: float) -> float:
    for index, item in enumerate(items):
        if index:
            y -= 11
        title = item["company"]
        if item["role"]:
            title += f'<br/><font name="{REGULAR}" color="#5E6472" size="7.4">{item["role"]}</font>'
        y = draw_paragraph(c, title, STYLES["role"], x, y, width)
        y -= 2
        y = draw_paragraph(c, item["dates"], STYLES["dates"], x, y, width)
        y -= 4
        y = draw_paragraph(c, item["description"], STYLES["body"], x, y, width)
        if item["skills"]:
            y -= 5
            y = draw_paragraph(c, " / ".join(item["skills"]), STYLES["skill_line"], x, y, width)
    return y


def draw_education(c: canvas.Canvas, items: list[dict], x: float, y: float, width: float) -> float:
    for item in sorted(items, key=lambda entry: entry.get("startYear", ""), reverse=True):
        title = f'<font name="{SEMIBOLD}">{item["school"]}</font><br/>{item["study"]}'
        y = draw_paragraph(c, title, STYLES["education"], x, y, width)
        y -= 2
        y = draw_paragraph(c, f'{item["startYear"]} - {item["endYear"]}', STYLES["dates"], x, y, width)
        if item.get("description"):
            y -= 2
            y = draw_paragraph(c, item["description"], STYLES["small"], x, y, width)
        y -= 8
    return y


def draw_technologies(c: canvas.Canvas, categories: list[dict], x: float, y: float, width: float) -> float:
    for category in categories:
        c.setFillColor(TEXT)
        c.setFont(SEMIBOLD, 7.5)
        c.drawString(x, y - 7, category["title"])
        y -= 12
        names = ", ".join(item["name"] for item in category["items"])
        y = draw_paragraph(c, names, STYLES["small"], x, y, width)
        y -= 7
    return y


def draw_competencies(c: canvas.Canvas, skills: list[dict], x: float, y: float, width: float) -> float:
    for skill in skills:
        c.setFillColor(TEXT)
        c.setFont(REGULAR, 7.3)
        c.drawString(x, y - 7, skill["name"])
        if skill.get("detail"):
            c.setFillColor(PRIMARY)
            c.setFont(SEMIBOLD, 7)
            c.drawRightString(x + width, y - 7, skill["detail"])
        c.setStrokeColor(LINE)
        c.setLineWidth(0.4)
        c.line(x, y - 11, x + width, y - 11)
        y -= 17
    return y


def build_pdf(locale: str, config: dict) -> Path:
    data_dir = config["data_dir"]
    ui_text = load_json(data_dir / "ui-text.json")
    experience = load_json(data_dir / "experience.json")
    academic = load_json(data_dir / "academic.json")
    skills = load_json(data_dir / "skills.json")
    for item in academic:
        if str(item.get("endYear", "")).lower() in {"current", "heden", "present"}:
            item["endYear"] = config["current"]

    output = config["output"]
    output.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(output), pagesize=A4, pageCompression=1)
    c.setTitle(f"Maurits Fokkens - CV ({locale.upper()})")
    c.setAuthor("Maurits Fokkens")
    c.setSubject(config["subject"])
    c.setCreator("cv.mau.bio PDF generator")
    c._doc.Catalog.Lang = PDFString(config["language"])

    c.setFillColor(PRIMARY)
    c.rect(0, PAGE_HEIGHT - 8, PAGE_WIDTH, 8, fill=1, stroke=0)

    portrait_size = 82
    portrait_x = PAGE_WIDTH - MARGIN - portrait_size
    portrait_y = PAGE_HEIGHT - MARGIN - portrait_size - 3
    c.drawImage(rounded_portrait(), portrait_x, portrait_y, portrait_size, portrait_size, mask="auto")

    c.setFillColor(TEXT)
    c.setFont(SEMIBOLD, 25)
    c.drawString(MARGIN, PAGE_HEIGHT - MARGIN - 20, ui_text["name"])
    c.setFillColor(PRIMARY)
    c.setFont(SEMIBOLD, 11.5)
    c.drawString(MARGIN, PAGE_HEIGHT - MARGIN - 42, config["job_title"])

    summary_width = PAGE_WIDTH - (MARGIN * 2) - portrait_size - 24
    summary_y = PAGE_HEIGHT - MARGIN - 58
    draw_paragraph(c, summary_from_about(ui_text["about_text"]), STYLES["summary"], MARGIN, summary_y, summary_width)

    body_top = PAGE_HEIGHT - 202
    body_bottom = 43
    left_width = 315
    gap = 20
    right_x = MARGIN + left_width + gap
    right_width = PAGE_WIDTH - MARGIN - right_x

    c.setFillColor(PANEL)
    c.roundRect(right_x - 12, body_bottom - 8, right_width + 24, body_top - body_bottom + 18, 10, fill=1, stroke=0)

    left_y = draw_section_title(c, config["sections"]["experience"], MARGIN, body_top, left_width)
    left_y = draw_experience(c, experience_items(experience, config), MARGIN, left_y, left_width)

    right_y = draw_section_title(c, config["sections"]["education"], right_x, body_top, right_width)
    right_y = draw_education(c, academic, right_x, right_y, right_width)
    right_y -= 2
    right_y = draw_section_title(c, config["sections"]["technology"], right_x, right_y, right_width)
    right_y = draw_technologies(c, skills["categories"], right_x, right_y, right_width)
    right_y -= 2
    right_y = draw_section_title(c, config["sections"]["competencies"], right_x, right_y, right_width)
    right_y = draw_competencies(c, skills["skills"], right_x, right_y, right_width)

    if min(left_y, right_y) < body_bottom:
        raise RuntimeError(f"{locale} content overflowed the one-page layout")

    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(MARGIN, 27, PAGE_WIDTH - MARGIN, 27)
    c.setFillColor(MUTED)
    c.setFont(REGULAR, 6.5)
    c.drawString(MARGIN, 15, "Maurits Fokkens")
    c.drawRightString(PAGE_WIDTH - MARGIN, 15, config["job_title"])

    c.showPage()
    c.save()
    return output


def main() -> None:
    register_fonts()
    outputs = [build_pdf(locale, config) for locale, config in LOCALES.items()]
    for output in outputs:
        print(output.relative_to(ROOT))


if __name__ == "__main__":
    main()

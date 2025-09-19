import csv, io, json
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4

def export_to_csv(results):
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["created_at","strike","dip","dip_direction"])
    writer.writeheader()
    for r in results:
        writer.writerow(r)
    return output.getvalue()

def export_to_json(results):
    return json.dumps(results, indent=2, ensure_ascii=False)

def export_to_pdf(results):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = [Paragraph("<b>GeoAnaliser Hisobot</b>", styles['Title']), Spacer(1, 12)]
    for r in results:
        story.append(Paragraph(f"⏱ <b>{r['created_at']}</b>", styles['Normal']))
        story.append(Paragraph(f"📐 Strike: {r['strike']}°", styles['Normal']))
        story.append(Paragraph(f"📏 Dip: {r['dip']}°", styles['Normal']))
        story.append(Paragraph(f"🧭 Dip Direction: {r['dip_direction']}°", styles['Normal']))
        story.append(Spacer(1, 10))
    doc.build(story)
    buffer.seek(0)
    return buffer

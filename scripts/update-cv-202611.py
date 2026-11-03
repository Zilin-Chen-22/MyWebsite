"""Update the archived CV with confirmed November 2026 enrollment details."""
from pathlib import Path
import subprocess, io, re
from xml.sax.saxutils import escape
from pypdf import PdfReader
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER

root = Path(__file__).resolve().parents[1]
# A fixed historical source prevents repeated runs from duplicating new entries.
source = subprocess.check_output(['git','show','d7cf74e:assets/files/Zilin_Chen_CV.pdf'], cwd=root)
text = '\n'.join(p.extract_text() for p in PdfReader(io.BytesIO(source)).pages)
text = text[text.index('EDUCATION'):]
text = re.sub(r'Aug\s+2022\s*-\s*present', 'Aug 2022 - Jun 2026', text)
text = text.replace('Current overall GPA until sophomore:', 'GPA through sophomore year:')
lines=[]
for raw in text.splitlines():
    line=' '.join(raw.split()).replace('–','-').replace('','•')
    if not line: continue
    lines.append(line)
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='CVBody',fontName='Helvetica',fontSize=9,leading=12,spaceAfter=4,textColor=colors.HexColor('#292b30')))
styles.add(ParagraphStyle(name='CVSection',fontName='Helvetica-Bold',fontSize=11,leading=15,spaceBefore=13,spaceAfter=7,textColor=colors.HexColor('#20252c'),keepWithNext=True))
styles.add(ParagraphStyle(name='CVName',fontName='Helvetica-Bold',fontSize=23,leading=29,spaceAfter=5))
styles.add(ParagraphStyle(name='CVEntry',fontName='Helvetica-Bold',fontSize=9.5,leading=13,spaceAfter=4,keepWithNext=True))
story=[Paragraph('Zilin Chen',styles['CVName']),Paragraph('PhD Student, Mechanical Engineering | The University of Hong Kong | ArcLab',styles['CVBody']),Paragraph('chenzili22@outlook.com | zilinchen79@gmail.com | (+86) 189-9550-1708',styles['CVBody'])]
sections={'EDUCATION','RESEARCH EXPERIENCES','LEADERSHIP AND ACTIVITIES','SKILLS'}
for line in lines:
    if line in sections:
        if line=='RESEARCH EXPERIENCES':
            story.extend([Paragraph('PROFESSIONAL EXPERIENCE',styles['CVSection']),Paragraph('Beijing Keyi Technology Co., Ltd. | Former employee',styles['CVEntry']),Paragraph('Decision &amp; Planning Algorithm Engineer | Joined Jul 2026 | Beijing, China',styles['CVBody'])])
        if line=='RESEARCH EXPERIENCES': story.append(PageBreak())
        story.append(Paragraph(line,styles['CVSection']))
        if line=='EDUCATION':
            story.extend([Paragraph('The University of Hong Kong | Nov 2026 - present',styles['CVEntry']),Paragraph('Full-time PhD in Mechanical Engineering | Expected completion: Oct 2030',styles['CVBody']),Paragraph('Field of study: Autonomous UAVs | Supervisor: Prof. Peng Lu',styles['CVBody']),Spacer(1,8)])
        continue
    style=styles['CVEntry'] if ('|' in line or line.startswith(('School of Mechanical','Department of Mechanical'))) else styles['CVBody']
    story.append(Paragraph(escape(line),style))
def footer(canvas,doc):
    canvas.setFont('Helvetica',8);canvas.setFillColor(colors.HexColor('#767b83'))
    canvas.drawString(40,26,'Updated 3 November 2026');canvas.drawRightString(555,26,str(doc.page))
dest=root/'assets/files/Zilin_Chen_CV.pdf'
SimpleDocTemplate(str(dest),pagesize=(595.28,841.89),rightMargin=40,leftMargin=40,topMargin=36,bottomMargin=42,title='Zilin Chen - Curriculum Vitae',author='Zilin Chen').build(story,onFirstPage=footer,onLaterPages=footer)
print(dest, len(PdfReader(dest).pages), 'pages')

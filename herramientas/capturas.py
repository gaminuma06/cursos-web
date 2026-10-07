"""Genera las imágenes de la landing a partir de los PDF reales del manual y los bonos.
Ejecutar: python sitio/herramientas/capturas.py"""
import pathlib, pymupdf
from PIL import Image

RAIZ = pathlib.Path(__file__).resolve().parents[2]
MAN = RAIZ / 'manuales' / 'riego-palma'
OUT = RAIZ / 'sitio' / 'manual_riego_goteo_palma' / 'img'
OUT.mkdir(parents=True, exist_ok=True)


def pagina(pdf, n, nombre, ancho=900):
    d = pymupdf.open(pdf)
    pix = d[n - 1].get_pixmap(dpi=150)
    im = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    im.thumbnail((ancho, ancho * 2))
    im.save(OUT / f'{nombre}.webp', quality=80)
    print(nombre, im.size)


manual = MAN / 'salida' / 'Manual-Riego-Palma-final.pdf'
for n, nombre in [(1, 'portada'), (3, 'mapa'), (37, 'p-goteros'), (81, 'p-resumen'), (100, 'p-caso'), (107, 'p-bomba'),
                  (94, 'p-aforo'), (122, 'p-lotes')]:
    pagina(manual, n, nombre, 1000 if n == 1 else 700)
pagina(MAN / 'bonos' / 'Bono3-Guia-de-Campo.pdf', 1, 'bono3', 600)
pagina(MAN / 'bonos' / 'Bono3-Guia-de-Campo.pdf', 5, 'bono3-tacto', 600)
pagina(MAN / 'bonos' / 'Bono2-Formatos-para-imprimir.pdf', 3, 'bono2', 700)
if (MAN / 'bonos' / '_bono1-resumen.pdf').exists():
    pagina(MAN / 'bonos' / '_bono1-resumen.pdf', 1, 'bono1', 700)

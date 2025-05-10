import os
import sys
import django
import random
from datetime import timedelta

# Configura Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blog.settings')
django.setup()

from django.utils import timezone
from posts.models import Post
from categories.models import Category
from taggit.models import Tag

# Ottieni categorie e tag esistenti
category_objects = list(Category.objects.all())
tag_objects = list(Tag.objects.all())

# Content template
content = """
# Ottimizzazione delle performance nel frontend

## Introduzione
Le prestazioni del frontend sono cruciali per offrire un'esperienza utente eccellente. In questo articolo, esploreremo tecniche avanzate per migliorare le performance.

## Contenuto principale
L'ottimizzazione delle performance frontend richiede un approccio sistematico che coinvolge diversi aspetti dell'applicazione:

1. **Caricamento delle risorse** - Utilizzare strategie come lazy loading e code-splitting
2. **Ottimizzazione delle immagini** - Implementare formati moderni e dimensioni responsive
3. **Rendering efficiente** - Minimizzare il DOM repainting e ottimizzare il critical rendering path
4. **Gestione dello stato** - Implementare strategie efficienti per la gestione dello stato dell'applicazione

## Metriche di performance
È importante monitorare costantemente le metriche di performance come:

- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)

### Punti chiave
- L'ottimizzazione è un processo continuo, non una soluzione una tantum
- Misurare prima di ottimizzare per individuare i veri colli di bottiglia
- Testare su dispositivi reali e connessioni lente per una valutazione accurata
- Automatizzare i test di performance nel pipeline CI/CD

## Conclusione
Investire nell'ottimizzazione frontend offre benefici tangibili in termini di coinvolgimento degli utenti e conversioni. Con le tecniche discusse in questo articolo, puoi migliorare significativamente l'esperienza utente della tua applicazione.
"""

# Creazione del post
post = Post(
    title="Ottimizzazione delle performance nel frontend",
    slug="test-post-1-ottimizzazione-performance-frontend",
    content=content,
    excerpt="Esplora tecniche avanzate per migliorare le prestazioni frontend e offrire un'esperienza utente eccellente.",
    featured_image="https://picsum.photos/seed/perf10/800/600",
    side_image_1="https://picsum.photos/seed/perf20/600/400",
    side_image_2="https://picsum.photos/seed/perf30/500/300",
    published_at=timezone.now() - timedelta(days=random.randint(0, 30)),
    status='published',
    is_featured=True
)

post.save()

# Aggiungi categorie
if category_objects:
    num_categories = random.randint(1, min(3, len(category_objects)))
    selected_categories = random.sample(category_objects, num_categories)
    post.categories.set(selected_categories)

# Aggiungi tag
if tag_objects:
    num_tags = random.randint(2, min(5, len(tag_objects)))
    selected_tags = random.sample(tag_objects, num_tags)
    post.tags.set(selected_tags)

print(f"Creato post mancante: Ottimizzazione delle performance nel frontend") 
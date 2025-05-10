import os
import sys
import django
import random
from datetime import datetime, timedelta

# Configura Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blog.settings')
django.setup()

from django.utils import timezone
from posts.models import Post
from categories.models import Category
from taggit.models import Tag

# Crea categorie di esempio se non esistono già
categories = ["Tecnologia", "Design", "Tutorial", "News", "Guide"]
category_objects = []

for cat_name in categories:
    category, created = Category.objects.get_or_create(
        name=cat_name,
        defaults={'slug': cat_name.lower(), 'description': f'Post sulla {cat_name}'}
    )
    category_objects.append(category)

# Crea tag di esempio
tags = ["javascript", "css", "react", "django", "nextjs", "python", "typescript", "tailwind"]
tag_objects = []

for tag_name in tags:
    tag, created = Tag.objects.get_or_create(name=tag_name)
    tag_objects.append(tag)

# Template per contenuto Markdown
MARKDOWN_TEMPLATE = """
# {title}

## Introduzione
{intro}

## Contenuto principale
{content}

### Punti chiave
{key_points}

## Conclusione
{conclusion}

"""

# Lista di URL di immagini di esempio (utilizziamo Picsum per immagini casuali)
IMAGE_URLS = [
    "https://picsum.photos/seed/{}/800/600",
    "https://picsum.photos/seed/{}/600/400",
    "https://picsum.photos/seed/{}/500/300"
]

# Titoli di esempio
post_titles = [
    "Come ottimizzare le immagini per il Web",
    "Le migliori pratiche per il design responsivo",
    "Introduzione a Next.js e React",
    "Sviluppare API RESTful con Django",
    "La guida definitiva a Tailwind CSS",
    "Tecniche di ottimizzazione SEO per blog",
    "Utilizzo di TypeScript con React",
    "Gestione dello stato in applicazioni complesse",
    "Strategie di caching per siti web veloci",
    "Architettura serverless: pro e contro",
    "Creare temi dark mode con CSS moderno",
    "La guida ai container Docker",
    "Machine Learning per principianti",
    "Implementare l'autenticazione JWT",
    "Progressive Web Apps: il futuro del web",
    "Blockchain e applicazioni decentralizzate",
    "GraphQL vs REST API",
    "Microservizi con Django e Next.js",
    "Test-Driven Development nella pratica",
    "Ottimizzazione delle performance nel frontend",
    "Sicurezza informatica per sviluppatori",
    "Design System: creare un linguaggio coerente",
    "Strategie CI/CD per piccoli team",
    "WebAssembly: la prossima frontiera",
    "Gestione dei dati in tempo reale con WebSockets"
]

# Frasi per generare contenuti
intros = [
    "In questo articolo esploreremo le basi di questo argomento.",
    "Imparare queste tecniche può migliorare significativamente il tuo lavoro.",
    "Analizziamo insieme questo tema importante per comprenderne le sfumature.",
    "Questo tutorial ti guiderà passo dopo passo attraverso il processo completo.",
    "Le tendenze recenti mostrano un crescente interesse in questo settore."
]

contents = [
    "Il contenuto principale richiede un'attenta analisi di vari fattori che influenzano il risultato finale. Consideriamo prima gli aspetti tecnici prima di passare alle implicazioni pratiche.",
    "Ci sono diversi approcci a questo problema, ognuno con i propri vantaggi e svantaggi. Analizziamo ciascuno di essi in dettaglio, concentrandoci sugli scenari d'uso più comuni.",
    "L'implementazione di questa soluzione comporta diversi passaggi, ognuno dei quali deve essere eseguito con attenzione. Iniziamo con la configurazione dell'ambiente e poi procediamo con lo sviluppo vero e proprio.",
    "Le migliori pratiche in questo campo si sono evolute nel tempo, passando da approcci semplici a metodologie più sofisticate. Esaminiamo l'evoluzione di queste pratiche e come applicarle oggi.",
    "Esistono strumenti specializzati che possono semplificare significativamente questo processo. Esploriamo le opzioni disponibili e come integrarle nel flusso di lavoro."
]

key_points = [
    "- L'ottimizzazione è fondamentale per le prestazioni\n- Gli strumenti automatici possono semplificare il processo\n- I test regolari garantiscono risultati costanti",
    "- La consistenza nel design migliora l'esperienza utente\n- Le piccole ottimizzazioni hanno un grande impatto\n- Documentare le decisioni aiuta la manutenzione futura",
    "- La scalabilità deve essere considerata fin dall'inizio\n- I pattern di design risolvono problemi comuni\n- I test automatici prevengono regressioni",
    "- L'approccio incrementale riduce i rischi\n- La retrocompatibilità è essenziale per l'adozione\n- Il feedback degli utenti guida il miglioramento",
    "- La semplicità è spesso meglio della complessità\n- Le prestazioni influenzano direttamente la conversione\n- La sicurezza non deve essere un ripensamento"
]

conclusions = [
    "In conclusione, questo approccio offre vantaggi significativi che non possono essere ignorati in un ambiente competitivo.",
    "Implementare queste tecniche richiede uno sforzo iniziale, ma i benefici a lungo termine superano ampiamente i costi.",
    "Con la continua evoluzione di questo campo, mantenersi aggiornati con le ultime tendenze è essenziale per rimanere competitivi.",
    "Sperimentare con queste tecnologie può aprire nuove possibilità e migliorare significativamente i flussi di lavoro esistenti.",
    "Il futuro in questo settore appare promettente, con nuove innovazioni all'orizzonte che promettono di risolvere le sfide attuali."
]

print("Inizio creazione di 20 post di test...")

# Genera 20 post di test
for i in range(1, 21):
    # Seleziona un titolo casuale rimuovendolo dalla lista
    if not post_titles:
        # Se abbiamo esaurito i titoli, ne creiamo uno generico
        title = f"Post di Test #{i} per scrolling infinito"
    else:
        title = random.choice(post_titles)
        post_titles.remove(title)
    
    # Crea lo slug dal titolo
    slug = f"test-post-{i}-{'-'.join(title.lower().split()[:3])}"
    
    # Genera il contenuto
    content = MARKDOWN_TEMPLATE.format(
        title=title,
        intro=random.choice(intros),
        content=random.choice(contents),
        key_points=random.choice(key_points),
        conclusion=random.choice(conclusions)
    )
    
    # Data di pubblicazione (casuale negli ultimi 30 giorni)
    pub_date = timezone.now() - timedelta(days=random.randint(0, 30), 
                                          hours=random.randint(0, 23), 
                                          minutes=random.randint(0, 59))
    
    # Crea il post
    post = Post(
        title=title,
        slug=slug,
        content=content,
        excerpt=f"Un post su {title} che esplora vari aspetti e tecniche importanti nel settore.",
        featured_image=random.choice(IMAGE_URLS).format(random.randint(1, 1000)),
        side_image_1=random.choice(IMAGE_URLS).format(random.randint(1, 1000)) if random.random() > 0.3 else None,
        side_image_2=random.choice(IMAGE_URLS).format(random.randint(1, 1000)) if random.random() > 0.6 else None,
        published_at=pub_date,
        status='published',
        is_featured=random.random() < 0.2  # 20% di probabilità di essere in evidenza
    )
    
    post.save()
    
    # Aggiungi categorie (1-3 categorie casuali)
    num_categories = random.randint(1, min(3, len(category_objects)))
    selected_categories = random.sample(category_objects, num_categories)
    post.categories.set(selected_categories)
    
    # Aggiungi tag (2-5 tag casuali)
    num_tags = random.randint(2, min(5, len(tag_objects)))
    selected_tags = random.sample(tag_objects, num_tags)
    post.tags.set(selected_tags)
    
    print(f"Creato post {i}/20: {title}")

print("Completato! Creati 20 post di test con successo.") 
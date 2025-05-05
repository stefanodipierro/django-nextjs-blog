import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify
from faker import Faker
from posts.models import Post
from categories.models import Category
from taggit.models import Tag

class Command(BaseCommand):
    help = 'Generate test posts for infinite scroll testing'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=100, help='Number of posts to generate')
        parser.add_argument('--featured', type=int, default=5, help='Number of featured posts')
        parser.add_argument('--clear', action='store_true', help='Clear existing posts before generating new ones')

    def handle(self, *args, **options):
        fake = Faker()
        count = options['count']
        featured_count = options['featured']
        clear = options['clear']

        # Check if we should clear existing posts
        if clear:
            self.stdout.write('Clearing existing posts...')
            Post.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Posts cleared.'))

        # Ensure we have some categories
        categories = list(Category.objects.all())
        if not categories:
            category_names = ['Technology', 'Travel', 'Food', 'Health', 'Business', 'Science', 'Art', 'Sports']
            self.stdout.write('Creating default categories...')
            for name in category_names:
                Category.objects.create(name=name, slug=slugify(name))
            categories = list(Category.objects.all())
            self.stdout.write(self.style.SUCCESS(f'Created {len(categories)} categories.'))

        # Create some common tags
        common_tags = ['test', 'sample', 'demo', 'example', 'infinite', 'scroll', 'pagination']
        for tag_name in common_tags:
            Tag.objects.get_or_create(name=tag_name)

        # Generate posts
        self.stdout.write(f'Generating {count} test posts...')
        for i in range(1, count + 1):
            # Create unique title and slug
            title = fake.sentence(nb_words=6)
            base_slug = slugify(title)
            slug = base_slug
            
            # Ensure slug is unique
            suffix = 1
            while Post.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{suffix}"
                suffix += 1
            
            # Determine if this post should be featured
            is_featured = i <= featured_count
            
            # Generate content
            paragraphs = fake.paragraphs(nb=random.randint(5, 15))
            content = '\n\n'.join([f'# {title}', *paragraphs])
            
            # Add some markdown features
            content += f'\n\n## Key Points\n'
            for _ in range(random.randint(3, 6)):
                content += f'\n* {fake.sentence()}'
            
            content += f'\n\n## Conclusion\n\n{fake.paragraph()}'
            
            # Create excerpt
            excerpt = fake.paragraph()
            
            # Random published date within last 30 days
            published_at = timezone.now() - timedelta(days=random.randint(0, 30))
            
            # Select random number of categories (1-3)
            post_categories = random.sample(categories, random.randint(1, min(3, len(categories))))
            
            # Create the post
            post = Post.objects.create(
                title=title,
                slug=slug,
                content=content,
                excerpt=excerpt,
                featured_image=f'https://picsum.photos/800/600?random={i}',
                published_at=published_at,
                status='published',
                is_featured=is_featured
            )
            
            # Add categories
            post.categories.set(post_categories)
            
            # Add tags
            tag_count = random.randint(2, 5)
            post_tags = random.sample(common_tags, min(tag_count, len(common_tags)))
            post.tags.add(*post_tags)
            
            # Add some unique tags
            post.tags.add(fake.word())
            
            if i % 10 == 0 or i == count:
                self.stdout.write(f'Created {i}/{count} posts')
        
        self.stdout.write(self.style.SUCCESS(f'Successfully generated {count} test posts.'))
        self.stdout.write(f'Featured posts: {featured_count}') 
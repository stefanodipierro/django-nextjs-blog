# 🚀 Production Deployment Guide

Questa guida ti aiuterà a deployare il Django Blog Template sulla VPS Hostinger in modo automatico e sicuro.

## 📋 **Informazioni VPS**

- **IP**: 217.65.144.19
- **OS**: Ubuntu 24.04 with Docker
- **Accesso**: SSH root
- **Specs**: 2 CPU cores, 8GB RAM, 100GB storage

## 🛠️ **Processo di Deployment**

### **Metodo 1: Transfer Automatico (Raccomandato)**

1. **Eseguire lo script di transfer dal tuo computer locale:**
   ```bash
   cd /path/to/your/blog
   chmod +x production-deploy/transfer-files.sh
   ./production-deploy/transfer-files.sh
   ```

2. **SSH nella VPS e eseguire il deployment:**
   ```bash
   ssh root@217.65.144.19
   cd /opt/blog-production
   ./deploy.sh
   ```

### **Metodo 2: Transfer Manuale**

Se preferisci trasferire i file manualmente:

1. **Trasferire i file di progetto:**
   ```bash
   rsync -avz --progress \
     --exclude='.git/' \
     --exclude='node_modules/' \
     --exclude='.next/' \
     --exclude='__pycache__/' \
     --exclude='*.pyc' \
     --exclude='.env.dev' \
     --exclude='production-deploy/' \
     --exclude='memory-bank/' \
     ./ root@217.65.144.19:/opt/blog-production/
   ```

2. **Trasferire i file di configurazione production:**
   ```bash
   scp production-deploy/docker-compose.prod.yml root@217.65.144.19:/opt/blog-production/
   scp production-deploy/frontend/Dockerfile.prod root@217.65.144.19:/opt/blog-production/frontend/
   scp production-deploy/deploy.sh root@217.65.144.19:/opt/blog-production/
   ```

3. **SSH e deployment:**
   ```bash
   ssh root@217.65.144.19
   cd /opt/blog-production
   chmod +x deploy.sh
   ./deploy.sh
   ```

## 🎯 **Cosa fa il deployment script:**

1. ✅ **System Updates** - Aggiorna i pacchetti del sistema
2. ✅ **Docker Setup** - Verifica e configura Docker/Docker Compose
3. ✅ **Firewall Config** - Configura UFW per sicurezza
4. ✅ **Environment Setup** - Genera `.env.prod` con configurazioni sicure
5. ✅ **Nginx Configuration** - Setup reverse proxy con cache
6. ✅ **Database Migration** - Esegue migrazioni Django
7. ✅ **Static Files** - Raccoglie e serve file statici
8. ✅ **Superuser Creation** - Crea admin user
9. ✅ **Backup Setup** - Configura backup automatici giornalieri
10. ✅ **Service Health Check** - Verifica che tutti i servizi funzionino

## 🌐 **Accesso al sito dopo deployment:**

- **Website**: http://217.65.144.19
- **Admin Panel**: http://217.65.144.19/admin
- **API**: http://217.65.144.19/api/v1
- **Credentials**: admin / production123!

## 📊 **Architettura Production**

```
Internet → Nginx (Port 80) → Django (Port 8000) ↔ PostgreSQL
                           → Next.js (Port 3000) ↔ Redis ↔ Celery
```

### **Servizi Docker:**

- **nginx**: Reverse proxy e static files
- **django**: Backend API con Gunicorn
- **frontend**: Next.js production build
- **db**: PostgreSQL database
- **redis**: Cache e message broker
- **celery**: Background tasks worker
- **celery-beat**: Scheduled tasks

## 🔧 **Comandi utili post-deployment:**

```bash
# Visualizzare i logs
docker-compose logs -f

# Riavviare un servizio specifico
docker-compose restart django

# Verificare lo stato dei container
docker-compose ps

# Accedere al container Django
docker-compose exec django bash

# Backup manuale
./scripts/backup.sh

# Aggiornamento del codice
./scripts/update.sh

# Monitorare le risorse
htop
```

## 📂 **Struttura delle directory:**

```
/opt/blog-production/
├── backend/              # Django application
├── frontend/             # Next.js application
├── nginx/               # Nginx configuration
├── scripts/             # Utility scripts
│   ├── backup.sh       # Database backup
│   └── update.sh       # Code updates
├── docker-compose.yml   # Production Docker config
├── .env.prod           # Production environment
└── deploy.sh           # Deployment script
```

## 🔒 **Sicurezza:**

- ✅ Firewall configurato (solo SSH, HTTP, HTTPS)
- ✅ Django DEBUG=False
- ✅ Secret keys generati automaticamente
- ✅ Database con password sicure
- ✅ Container isolati con least privilege
- ✅ Backup automatici con retention policy

## 📈 **Performance:**

- ✅ Nginx reverse proxy con cache
- ✅ Static files ottimizzati
- ✅ Gunicorn con 3 workers
- ✅ Redis per caching
- ✅ PostgreSQL ottimizzato
- ✅ Next.js production build

## 🔄 **Backup e Recovery:**

I backup vengono eseguiti automaticamente ogni giorno alle 2:00 AM:

- **Database**: Dump SQL completo
- **Media files**: Archivio compresso
- **Retention**: 30 giorni
- **Location**: `/opt/backups/blog/`

## 🚨 **Troubleshooting:**

### **Servizi non si avviano:**
```bash
docker-compose down
docker-compose up --build -d
docker-compose logs -f
```

### **Problemi di permessi:**
```bash
sudo chown -R root:root /opt/blog-production
sudo chmod +x /opt/blog-production/deploy.sh
```

### **Reset completo:**
```bash
docker-compose down -v
docker system prune -a
./deploy.sh
```

### **Verificare connettività:**
```bash
curl -I http://217.65.144.19
curl -I http://217.65.144.19/admin/
curl -I http://217.65.144.19/api/v1/posts/
```

## 📞 **Support:**

Per problemi o domande:
1. Verificare i logs: `docker-compose logs -f`
2. Controllare lo stato dei servizi: `docker-compose ps`
3. Verificare la configurazione: `cat .env.prod`

## 🎉 **Prossimi Steps:**

Dopo il deployment riuscito:
1. ✅ Accedere all'admin e creare i primi post
2. ✅ Testare tutte le funzionalità
3. 🔄 Configurare SSL (Let's Encrypt) se necessario
4. 🔄 Configurare un dominio personalizzato
5. 🔄 Setup monitoring (optional)

---

**Deployment automatico creato per VPS Hostinger - Ubuntu 24.04 with Docker** 
# Nova CRM

##  Description
Nova CRM est une application web de gestion de la relation client (CRM) développée avec Next.js et Supabase.

Elle permet de gérer :
- les utilisateurs et leurs rôles
- les contacts et entreprises
- les leads et le pipeline commercial
- les tâches et échéances
- les emails (manuels et automatiques)
- les statistiques et KPI

---

##  Démo en ligne
https://nova-crm-rho.vercel.app
---

##  Stack technique

### Frontend
- Next.js (App Router)
- React
- Tailwind CSS

### Backend
- Server Actions (Next.js)
- API Routes

### Base de données
- PostgreSQL (via Supabase)

### Authentification
- Supabase Auth

### Emailing
- Brevo (Sendinblue)

### Déploiement
- Vercel

---

##  Fonctionnalités principales

### Gestion des utilisateurs
- Inscription / connexion
- Gestion des rôles (admin, sales, standard)

### Contacts & Entreprises
- CRUD complet
- Association contact → entreprise
- Recherche et filtres

### Leads & Pipeline
- Suivi des prospects
- Statuts : new, contacted, qualified, proposal, negotiation, converted, lost
- Pipeline visuel
- Funnel de conversion

### Tâches
- Création de tâches
- Statuts (todo, in_progress, done, late)
- Calendrier
- Tâches urgentes / en retard

### Emails
- Envoi manuel
- Templates
- Historique
- Emails automatiques (création lead + qualification)

### Dashboard
- KPI
- Taux de conversion
- Leads par source
- Funnel
- CA signé
- Leaderboard commerciaux

---

##  Installation locale

```bash
git clone https://github.com/Lynda-HAFIDI/nova-crm.git
cd nova-crm
npm install
npm run dev
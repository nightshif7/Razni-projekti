# 🧮 MathQuest — Deployment Upute za Proxmox
## Verzija: 1.0 | Datum: 2026-03-23

---

## 📋 KONTEKST

Radi se o edukativnoj web aplikaciji **MathQuest** — interaktivni matematički kvizovi
za osnovnu školu (1-4. razred, Hrvatski kurikulum). Frontend je React/Vite SPA
(Single Page Application), bez backenda i bez baze podataka.

**Cilj:** Aplikacija mora biti dostupna na lokalnoj mreži putem browsera s bilo kojeg uređaja.

---

## 🖥️ INFRASTRUKTURA

| Stavka | Vrijednost |
|--------|-----------|
| Proxmox GUI | https://192.168.50.233:8006/ |
| Proxmox SSH | root@192.168.50.233 |
| Proxmox Password | Pa55w.rd |
| Ciljni port aplikacije | **5173** |
| Ciljni URL | http://192.168.50.233:5173 ili novi LXC IP |

---

## 📦 DATOTEKE ZA DEPLOY

Uz ove upute priložen je `mathquest.zip` koji sadrži:

```
mathquest/
├── dist/                          ← Gotova build verzija aplikacije (servira se)
│   ├── index.html
│   └── assets/
│       └── index-BOuxRjzx.js      ← Cijela app u jednom JS fajlu (194KB)
├── src/
│   ├── App.jsx                    ← React source kod aplikacije
│   └── main.jsx                   ← React entry point
├── index.html                     ← HTML template
├── package.json                   ← Node.js dependencies
├── vite.config.js                 ← Vite konfiguracija (host: 0.0.0.0, port: 5173)
└── start.sh                       ← Startup skripta
```

---

## 🚀 OPCIJA A — Preporučeno: Novi LXC kontejner na Proxmoxu

### Korak 1 — Spoji se na Proxmox

```bash
ssh root@192.168.50.233
# Password: Pa55w.rd
```

### Korak 2 — Preuzmi Ubuntu template (ako već nemaš)

```bash
pveam update
pveam download local ubuntu-22.04-standard_22.04-1_amd64.tar.zst
```

### Korak 3 — Kreiraj LXC kontejner

```bash
pct create 200 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
  --hostname mathquest \
  --memory 512 \
  --cores 1 \
  --rootfs local-lvm:8 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --unprivileged 1 \
  --password mathquest123 \
  --start 1
```

> ℹ️ ID kontejnera je 200 — promijeni ako je zauzet. Provjeri: `pct list`

### Korak 4 — Uđi u kontejner

```bash
pct enter 200
```

### Korak 5 — Instaliraj Node.js i potrebne alate

```bash
apt update && apt upgrade -y
apt install -y curl wget unzip

# Instaliraj Node.js 22 (LTS)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Provjeri verzije
node --version   # treba biti v22.x
npm --version    # treba biti 10.x
```

### Korak 6 — Prenesi mathquest.zip u kontejner

**S lokalnog računala** (van SSH sesije, u novom terminalu):
```bash
# Dohvati IP kontejnera
pct exec 200 -- hostname -I

# Kopiraj zip (zamijeni KONTEJNER_IP)
scp mathquest.zip root@KONTEJNER_IP:/root/
```

**Alternativa — wget direktno u kontejneru** ako je zip negdje dostupan:
```bash
wget http://ADRESA/mathquest.zip -O /root/mathquest.zip
```

### Korak 7 — Raspakiraj i pripremi

```bash
cd /root
unzip mathquest.zip
cd mathquest
npm install
```

### Korak 8 — Testiraj da radi

```bash
npm run build    # regenerira dist/ (opcionalno, već je buildano)
npx vite preview --host 0.0.0.0 --port 5173
```

Otvori browser: `http://KONTEJNER_IP:5173` — treba raditi!

### Korak 9 — Postavi kao systemd servis (autostart)

```bash
cat > /etc/systemd/system/mathquest.service << 'EOF'
[Unit]
Description=MathQuest Web App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/mathquest
ExecStart=/usr/bin/npx vite preview --host 0.0.0.0 --port 5173
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.default.target
EOF

systemctl daemon-reload
systemctl enable mathquest
systemctl start mathquest
systemctl status mathquest
```

### Korak 10 — Provjeri finalni URL

```bash
# Dohvati IP kontejnera
hostname -I
```

Aplikacija je dostupna na: `http://<IP_KONTEJNERA>:5173`

---

## 🚀 OPCIJA B — Direktno na Proxmox host (brže, ali nije best practice)

> ⚠️ Ne preporučuje se miješati aplikacije s Proxmox hostom, ali funkcionira za testiranje.

```bash
# SSH na Proxmox
ssh root@192.168.50.233

# Instaliraj Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs unzip

# Prenesi i raspakiraj mathquest.zip u /opt
unzip mathquest.zip -d /opt/
cd /opt/mathquest
npm install

# Pokretanje
npx vite preview --host 0.0.0.0 --port 5173
```

Aplikacija dostupna na: `http://192.168.50.233:5173`

**Autostart kao servis:**
```bash
cat > /etc/systemd/system/mathquest.service << 'EOF'
[Unit]
Description=MathQuest Web App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/mathquest
ExecStart=/usr/bin/npx vite preview --host 0.0.0.0 --port 5173
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.default.target
EOF

systemctl daemon-reload
systemctl enable mathquest
systemctl start mathquest
```

Aplikacija dostupna na: `http://192.168.50.233:5173`

---

## 🔧 KORISNE KOMANDE

```bash
# Status servisa
systemctl status mathquest

# Restart
systemctl restart mathquest

# Logovi
journalctl -u mathquest -f

# Zaustavljanje
systemctl stop mathquest

# Provjera porta
ss -tlnp | grep 5173
```

---

## 🔄 AŽURIRANJE APLIKACIJE

Kad se promijeni kod aplikacije:

```bash
# Na računalu gdje je source kod:
npm run build
# Kopiraj novi dist/ folder na server (scp ili rsync)
scp -r dist/ root@SERVER_IP:/root/mathquest/

# Na serveru — restart
systemctl restart mathquest
```

---

## ✅ CHECKLIST ZA PROVJERU

- [ ] Node.js instaliran (`node --version`)
- [ ] `mathquest.zip` raspakiran u `/root/mathquest` ili `/opt/mathquest`
- [ ] `npm install` uspješno izvršen
- [ ] `dist/` folder postoji i nije prazan
- [ ] Port 5173 otvoren (`ss -tlnp | grep 5173`)
- [ ] Browser test: `http://IP:5173` prikazuje MathQuest
- [ ] Systemd servis aktivan (`systemctl status mathquest`)
- [ ] Autostart omogućen (`systemctl is-enabled mathquest`)

---

## 🌐 PRISTUP S LOKALNE MREŽE

Nakon uspješnog deploya, aplikacija je dostupna na:

| Uređaj | URL |
|--------|-----|
| Laptop/PC | http://IP_SERVERA:5173 |
| Mobitel (ista WiFi) | http://IP_SERVERA:5173 |
| Tablet | http://IP_SERVERA:5173 |

**Nema potrebe** za internet vezom — sve radi lokalno! 🎉

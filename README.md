# Adblocker

folder structure
```
Adblocker_CoreOnly/
├── manifest.json                 ← Core extension config
├── background.js                 ← Startup script (stable)
├── popup/                        ← UI folder
│   ├── popup.html                ← UI structure
│   └── popup.js                  ← Toggle behavior (can evolve)
├── styles/
│   └── popup.css                 ← UI styling
├── icons/
│   └── catshield128.png          ← Placeholder icon (can swap image)
├── README.html                   ← Step-by-step user guide
└── rules/
    └── rules.json                ← Your blocklist file (editable)
```

this project is not done YET! hopefully it will be done soon! 
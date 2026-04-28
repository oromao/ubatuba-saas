# Skill: GeoJSON Contract Check
**Objetivo:** Evitar falhas na renderização de Mapas (CTM/REURB).
**Regras de Ouro:** FeatureCollection deve ser estrito ao RFC 7946. Nenhuma `Polygon` com right-hand rule inválida será tolerada pelos parsers.\n
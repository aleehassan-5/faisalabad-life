# Faisalabad Life
Open-world 3D game inspired by Faisalabad, Pakistan. Built with Three.js (runs in browser, no install).

## Run
```
python3 -m http.server 8000
```
Open http://localhost:8000

## Controls
W/S gas/brake, A/D steer, Space handbrake/drift, C camera toggle.

## Status
- Chunk 1: drivable car, chase/cockpit camera, speedometer, test road grid. (Untested in a real browser by the author's sandbox — see notes.)
- Chunk 2: left-side AI traffic (lane following, brakes for car ahead), rotating minimap, basic player-traffic collision. No traffic signals yet.
- Chunk 3: 70 vehicles (cars, rickshaws, motorcycles, buses, decorated trucks), headlights/tail lights, working traffic signals at the junction, bikes pass slow traffic, oriented-box collisions.

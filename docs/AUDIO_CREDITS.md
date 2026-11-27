# Audio credits

All sound in the BARBIE archive is **synthesised in the browser** with the Web
Audio API by `frontend/src/lib/sound.ts`. There are no sampled recordings, no
audio files, and therefore no third-party licences to clear.

| Effect | Where it is used | How it is made |
| --- | --- | --- |
| `seal-break` | Pressing the wax seal on the entrance | Band-passed white noise sweeping 2.6 kHz → 420 Hz, plus four short square-wave crack fragments |
| `cover-open` | The covers swinging open | Low-passed noise sweeping 300 Hz → 2.2 kHz → 500 Hz, layered with a sine sub-tone falling 150 Hz → 58 Hz |
| `page-turn` | Turning a page in the reading view *(wired with the page-turn engine)* | Band-passed noise with a 700 Hz → 3.4 kHz → 520 Hz sweep |
| `book-open` | Entering a room from the room index *(wired with the room router)* | Two short band-passed noise swells 140 ms apart |
| `object-tap` | Interacting with an object in a room *(wired with the interactive rooms)* | Triangle-wave click falling 880 Hz → 340 Hz |
| `drawer` | Opening the Cabinet of Curiosities *(wired with the Cabinet room)* | Band-passed noise with a resonant 260 Hz → 900 Hz → 380 Hz sweep |

## Behaviour

- Sound is **off by default**. The preference is stored in `localStorage`
  (`barbie:sound`) through `frontend/src/lib/prefs.ts`, with an in-memory
  fallback when storage is unavailable.
- No `AudioContext` is created before the first user gesture.
- If Web Audio is unavailable, or a context cannot start, the manager is a
  silent no-op — sound never blocks or breaks the interface.
- `docs/` records the source of truth; the implementation lives in
  `frontend/src/lib/sound.ts`.

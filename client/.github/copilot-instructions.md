# Moodiify Client - AI Agent Instructions

## Project Overview

**Moodiify** is an AI-powered music recommendation web app using React 18 + Vite with TailwindCSS. The frontend captures user intent through multiple input methods (voice, text, location, audio recording) and communicates with a Node.js backend for AI-powered recommendations.

## Architecture & Data Flow

### Core Input Pathways
1. **Voice Search** (`src/utils/voice_search_song.js`): Web Speech API → OpenAI Service → Song Suggestions
2. **Audio Recording** (`src/utils/recording.js`): MediaRecorder API → Backend ACRCloud → Song Recognition
3. **Location-Based** (`src/components/Map/MapComponent.jsx`): Google Maps API → Backend → Geo-personalized recommendations
4. **Text/Form Input** (`src/components/Form/Form.jsx`): User input → OpenAI API → Song list

### State Management
- **SearchContext** (`src/Contexts/SearchContext.jsx`): Global UI state for recording, map, form visibility, and song suggestions
- **UserContext** (declared in contexts): Expected to hold authentication and user profile
- **RemoveContext** (`src/Contexts/RemoveContext.jsx`): Likely for playlist management
- User data stored in localStorage as JSON: `JSON.parse(localStorage.getItem("user"))`

### Service Layer Pattern
- **OpenAI_service.js**: POSTs transcripts to `http://{VITE_SERVER_URL}/api/openai` with Bearer token
- **YouTube_service.js**: GETs recommendations from `/moodiify/recommends/` with country & song name

## Build & Development

```bash
npm run dev       # Vite dev server on localhost:5173 (base path: /moodiify)
npm run build     # Production build to dist/
npm run lint      # ESLint check
npm run preview   # Preview production build
```

**Critical Config**: `vite.config.js` sets `base: "/moodiify"` — all routing uses this basename via `<BrowserRouter basename="/moodiify">`.

## Component Organization

- **Pages** (`src/pages/`): Route-level components (Home, Login, Register, CategoryPlaylists, SongsPlaylist)
- **Components** (`src/components/`): Reusable UI modules with `.module.css` (each component has scoped styles)
- **UI Library**: Mix of custom components + shadcn-ui + HeroUI (Button, Card, Image)
- **Icons**: Lucide-react + custom SVG components (MicrophoneAnimation, spinner)

**Example Component Pattern**:
```jsx
// Button/Button.jsx with Button/Button.module.css
import styles from "./Button.module.css"
export default function Button({...}) { 
  return <button className={styles.btn}>...</button>
}
```

## Key Dependencies & APIs

| Purpose | Library | Configuration |
|---------|---------|---|
| Routing | React Router v7 | BrowserRouter with `/moodiify` basename |
| Styling | TailwindCSS + Module CSS | `@tailwindcss/vite` plugin |
| HTTP | Axios | Bearer token in Authorization header |
| Maps | @vis.gl/react-google-maps | Requires VITE_GOOGLE_MAPS_API_KEY |
| Audio | Web Speech API, MediaRecorder | No library (native browser APIs) |
| UI Components | @heroui, shadcn-ui, lucide-react | Available in `src/components/ui/` |
| Notifications | react-hot-toast, react-toastify | Used in error/success feedback |
| YouTube | react-youtube | For embedded video playback |
| Animation | @lottiefiles/dotlottie-react, motion | Smooth transitions & animations |

## Environment Variables (Required)

```
VITE_SERVER_URL=localhost:5000    # Backend URL (no protocol)
VITE_GOOGLE_MAPS_API_KEY=...
VITE_SPOTIFY_TOKEN=...
# Others injected at runtime via backend
```

## Common Patterns & Conventions

### Token-Based Auth
All API calls require JWT token from `user.token` in localStorage. Attach via:
```javascript
headers: { Authorization: `Bearer ${user.token}` }
```

### Song Suggestions Flow
1. Capture user input (voice, text, recording, location)
2. Send to backend service (OpenAI, YouTube, ACRCloud)
3. Update `SearchContext.setSongSuggestions()`
4. Render in `Songs.jsx` or `VideoSong.jsx` component

### Module CSS Imports
Always import scoped styles: `import styles from "./Component.module.css"`
Combine with TailwindCSS for utility classes.

## File Naming & Structure

- `.jsx`: React components
- `.module.css`: Component-scoped styles (CSS Modules)
- `.ts`/`.tsx`: TypeScript (UI components in `ui/` folder)
- Services in `src/services/` — API communication only
- Utilities in `src/utils/` — Helper functions (recording, voice, country mapping, auth)

## Debugging Tips

- **Recording issues**: Check browser permissions & `navigator.mediaDevices.getUserMedia()`
- **Voice search**: Verify `window.SpeechRecognition` exists; fallback to `webkitSpeechRecognition`
- **Token errors**: Ensure `localStorage.user` exists and has valid JWT
- **API 404s**: Check `VITE_SERVER_URL` matches backend; verify `/moodiify` path for public assets
- **CORS**: All requests routed through backend proxy (no direct external API calls from frontend)

## Integration Points (Frontend ↔ Backend)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/openai` | POST | Send voice transcript → get song suggestions |
| `/moodiify/recommends/` | GET | Fetch YouTube songs by name & country |
| `/songs/recognize` | POST | Send audio blob → ACRCloud identification |
| `/auth/login`, `/auth/register` | POST | User authentication |
| `/playlists/*` | GET/POST | Manage user playlists |

## Testing Commands

```bash
npm run lint       # Check code quality
```

No test runner configured yet. Consider adding Jest + React Testing Library.

## Rapid Development Workflow

1. **New feature**: Create component in appropriate folder
2. **Styling**: Add `.module.css` file alongside component
3. **State**: Use SearchContext for UI state; UserContext for auth
4. **API calls**: Create service in `src/services/`, call from component with `user.token`
5. **Test**: `npm run dev` → browse to `http://localhost:5173/moodiify`

# DevForge

DevForge is a project and task workspace backed by the existing Express API.

## Run the application

1. Start the existing backend from `backend/` with `npm run dev` (or `npm start`). It listens on port `5000` by default and uses the project-root `.env`.
2. In a separate terminal, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

3. Open the Vite URL printed in the terminal. The frontend connects to `http://localhost:5000/api` by default. To use a different API base URL, set the public Vite variable `VITE_API_URL` in the frontend process environment; do not put backend secrets in the frontend.

The frontend provides registration and login, authenticated project and task management, project progress from the backend, and responsive dashboard navigation. The project builder saves drafts locally and previews a clearly labeled, frontend-only analysis outline; it does not call an AI service or create a project until you choose **Create Project**.

Settings are available from the workspace sidebar. Appearance, notification, AI, workspace, and general preferences are saved under the browser-local `devforgeSettings` key. Profile edits and the avatar are also local-only because the current API does not support profile updates. Project and task exports use the authenticated APIs; deleting all projects requires typed confirmation and uses the existing task/project delete routes. Account deletion, password changes, sessions, API keys, email delivery, and AI providers are not available through the current backend.

Project Details also supports authenticated project assets. Files are stored locally in `backend/uploads/`, limited to 5 MB each, and their metadata is saved in the owning project's `assets` array. The uploads folder is excluded from Git; back up or migrate these files separately before deploying or moving the backend.

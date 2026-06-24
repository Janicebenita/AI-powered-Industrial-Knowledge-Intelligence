# Industrial Brain AI Mobile

Expo React Native mobile app for field technicians, reliability engineers, safety officers, and auditors.

## Features

- Mobile executive dashboard connected to the FastAPI backend
- Field document upload through the same ingestion endpoint
- AI Copilot with source-cited answers
- Asset 360 mobile cards
- Maintenance and compliance summaries
- Report PDF opening from backend report endpoints

## Run Locally

Start the backend first:

```powershell
cd ..\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Start the mobile app:

```powershell
cd ..\mobile
npm install
npm run start
```

For a real phone on the same Wi-Fi network, update `src/api.ts`:

```ts
export const API_BASE = "http://YOUR_COMPUTER_LAN_IP:8000";
```

Example:

```ts
export const API_BASE = "http://192.168.1.25:8000";
```

Then scan the Expo QR code with Expo Go.

## Notes

- Android emulator can usually call the host machine at `http://10.0.2.2:8000`.
- iOS simulator can usually call `http://127.0.0.1:8000`.
- Physical devices need the LAN IP address of the backend machine.

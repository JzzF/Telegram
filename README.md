# Time Attack Tetris - Telegram Mini App

A fast-paced Tetris variant designed specifically for Telegram Mini Apps platform. Features time-based gameplay, progressive difficulty, and dynamic music system.

## Deployment Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Save the bot token provided

### 2. Create Mini App

1. In BotFather, send `/newapp` command
2. Select your bot
3. Follow instructions to set up your Mini App:
   - Short name: `timeattacktetris`
   - Description: "Time Attack Tetris - A fast-paced 90-second challenge"
   - Choose Web App option

### 3. Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the app:
   ```bash
   vercel
   ```

4. After deployment, copy the production URL (e.g., `https://your-app.vercel.app`)

### 4. Configure Mini App URL

1. Go back to [@BotFather](https://t.me/botfather)
2. Send `/myapps` command
3. Select your Mini App
4. Choose "Edit Web App URL"
5. Paste your Vercel deployment URL

### 5. Test the Mini App

1. Open your bot in Telegram
2. Start the bot
3. The Mini App button should appear
4. Click to launch the game

## Game Features

- 90-second time attack gameplay
- Progressive difficulty phases
- Dynamic music system
- Touch and keyboard controls
- Combo scoring system
- Responsive design
- Beautiful animations

## Technical Details

- Pure JavaScript implementation
- Canvas-based rendering
- Responsive mobile-first design
- Telegram WebApp SDK integration
- Local storage for high scores

## Development

To run locally:
1. Clone the repository
2. Open `index.html` in a web browser
3. For Telegram integration testing, use ngrok or similar tool to create HTTPS tunnel

## License

MIT License - feel free to use and modify!

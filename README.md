# Finish The Line (Party Trivia Web App)

A real-time multiplayer and couch party trivia game based on progressive word-by-word clue reveals. Players race to complete iconic quotes from **Anime & Manga**, **Movies**, **Video Games**, **TV Shows**, **Hip-Hop Lyrics**, **Superheroes**, **Memes**, and more!

---

## Heads-Up Style Category Decks (100+ Quotes)

Choose between focused single decks or mix and match any combination:
1. ** Anime & Manga:** *Dragon Ball Z, Naruto, One Piece, Attack on Titan, Jujutsu Kaisen, Demon Slayer, Bleach, Death Note, JoJo's Bizarre Adventure, Cowboy Bebop.*
2. ** Movies & Cinema:** *The Godfather, Star Wars, Terminator, Pulp Fiction, Titanic, Matrix, Casablanca, Gladiator, Fight Club, Apollo 13.*
3. ** Video Games:** *Skyrim, Portal, The Legend of Zelda, Metal Gear Solid, Fallout, BioShock, Halo, Dark Souls, Mass Effect, GTA San Andreas, Far Cry 3, God of War.*
4. ** TV & Sitcoms:** *The Office, Friends, Breaking Bad, Game of Thrones, Brooklyn Nine-Nine, The Wire, The Simpsons.*
5. ** Hip-Hop & Song Lyrics:** *Eminem, Queen, Drake, Jay-Z, Taylor Swift, Michael Jackson, Nirvana, Kendrick Lamar, Tupac Shakur, Adele.*
6. ** Superheroes & Comics:** *Iron Man, Batman, Spider-Man, Captain America, The Joker, Thanos, Captain Marvel.*
7. ** Sci-Fi & Fantasy:** *Dune, Star Trek, Doctor Who, The Witcher, Lord of the Rings, Blade Runner.*
8. **️ Famous Speeches & History:** *Martin Luther King Jr., Neil Armstrong, Winston Churchill, JFK, FDR, Julius Caesar.*
9. ** Classic Literature:** *Hamlet, 1984, A Tale of Two Cities, Moby-Dick, The Hobbit, Pride and Prejudice, Alice in Wonderland, The Great Gatsby.*
10. ** Internet Memes & Viral:** *Rickroll, Captain Phillips ("I'm the captain now"), Sweet Brown, What Are Those, Why You Always Lying, Free Real Estate.*
11. ** Pop Culture Mix:** *Stranger Things, Big Bang Theory, RuPaul's Drag Race, etc.*

---

## Game Modes & Device Screen Options

### 1. ️ Pass & Play / Couch Co-Op (Single Screen)
- Gather friends around a laptop, TV, or desktop screen.
- Supports **2 to 6 players** on the same machine.
- Each player has an on-screen tactile buzzer button and designated keyboard hotkey:
  - **Player 1:** `Space`
  - **Player 2:** `Enter`
  - **Player 3:** `Q`
  - **Player 4:** `P`
  - **Player 5:** `Z`
  - **Player 6:** `M`
- Host controls: "Reveal Next Word" (`Space`/`N`), "Correct", "Wrong/Lockout", "Skip Quote", "+100 Voice Impression Bonus".

### 2.  Online Multiplayer (LAN / Wi-Fi Room Code System)
- **Host Screen (TV/Projector):** Big TV presentation view with 4-letter room code (e.g. `WORD`), scannable **QR code**, category deck selector, and player roster.
- **Phone Controller Screen Options:**
  - **Option A (Buzzer Controller):** Big responsive tactile 3D buzzer with vibration and sound.
  - **Option B (Viewer / Spectator Display - No Buzzer):** For players on the couch or audience members who just want to display the live quote card, hint, and leaderboard on their phone without a buzzer taking up the screen or accidental presses.
  - **On-the-Fly Toggle:** Any player can toggle `Buzzer: ON` / `No Buzzer` with one tap on their screen, and the host can also toggle any player's buzzer in the lobby.

---

## Scoring System

Points are awarded dynamically based on how few words were revealed when solved:
- **1–2 Words Revealed:** `500 PTS`
- **3–4 Words Revealed:** `300 PTS`
- **5–6 Words Revealed:** `150 PTS`
- **7+ Words Revealed:** `50 PTS`
- **Host Character Impression Bonus:** `+100 PTS` (awarded for acting / voice impressions!)

---

## Quick Start Guide

### 1. Run Development Mode
Starts both the WebSocket backend and the Vite frontend:
```bash
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.
- Other devices on your local Wi-Fi network can join using the displayed Network IP address.

### 2. Production Build & Start
```bash
npm run build
npm start
```
Starts the unified server on port `3001` serving both the WebSockets and the optimized production frontend.

### 3. Run Automated Tests
```bash
node server/testGame.js
```

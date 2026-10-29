# WAR: Modifiers Unleashed ⚔️🃏

A tactical multiplayer web-based card game based on the classic game of **War**, supercharged with **hidden information**, **strategic hand management**, **catch-up modifier meters**, and **game-altering modifier cards**.

Created for COMP 440 - Game Design.

---

## 🎮 Game Rules & Mechanics

### 1. Objective & Starting State
* **Win Condition:** Reduce your opponent's hand to **0 cards**.
* **Starting Deal:** Each player is dealt **5 Normal Cards** from a shared 54-card deck (52 standard cards + 2 Jokers) and **1 starting Modifier Card**.
* **Shared Deck & Discard:** All played normal cards go to a central discard pile. If the draw deck runs out, the discard pile is reshuffled into the deck.

### 2. Jokers (Rank 15)
* Jokers are the highest rank (beats Aces).
* **The Strategic Penalty:** Playing a Joker immediately **resets your Modifier Meter to 0** and **grants +0 meter** this round (win or lose).

### 3. Turn Sequence (Face Down Commitment)
Actions are chosen in this exact order:
1. **Play a Modifier Card (Optional):** Selected from your modifier hand.
2. **Play a Normal Card (Required):** Selected from your 5-card hand.
3. **Confirm:** Both cards are placed face down. The opponent can see if you played a modifier, but the card identity remains hidden.

### 4. Battle Clash & Reveal Order
Once both commanders confirm, the clash begins in sequential stages:
1. **Normal Cards Reveal:** Both normal cards flip face-up simultaneously.
2. **Tentative Leader Check:**
   * If ranks are different: The player who *would win* under base rules flips their modifier **FIRST** and resolves it.
   * If normal cards tie:
     * The player with **fewer cards in hand** flips **FIRST** (the player currently winning overall flips second).
     * If hand sizes are tied: The player with **more modifier cards** in hand flips **FIRST**.
     * If both are tied: A **coin flip** decides who flips first.
3. **First Modifier Resolves:** Activates its effect on the board.
4. **Second Modifier Resolves:** Can counter, reverse, or stack on top of the first modifier!

### 5. Stalemate & War Stakes
* On a tie, the next round becomes **doubled stakes (2x, 4x, etc.)**!
* The winner of the subsequent round claims both rounds' spoils.
* Consecutive ties continue to stack doubled stakes!

### 6. The Modifier Meter (Catch-Up System)
* Fills as you battle:
  * **+1 point** on a round win.
  * **+2 points** on a round loss (fills twice as fast on defeat!).
* When the meter reaches **10 points** (e.g. 5 losses or 10 wins), you immediately draw a new Modifier Card from the modifier deck, and your meter resets to 0.

---

## ⚡ Included Modifier Cards

| Modifier Card | Rarity | Badge | Tactical Effect |
| :--- | :---: | :---: | :--- |
| **The Inversion** | Common | `LOW WINS` | Lowest card wins this round instead of the highest. |
| **The Golden Mean** | Common | `CLOSEST 7` | The card closest in rank to 7 wins this round. |
| **Overkill** | Common | `+1 DAMAGE` | The losing player loses an additional card from their hand. |
| **Nullify** | Rare | `COUNTER` | Cancels and negates the opponent's modifier card this round. |
| **Double Down** | Rare | `HIGH STAKES` | Winner draws 2 cards; loser discards an extra card. |
| **Pickpocket** | Rare | `STEAL CARD` | Winner takes the loser's played normal card into their hand instead of discard. |
| **Tactical Retreat** | Common | `PRESERVE` | If you lose this round, your played card returns safely to your hand. |
| **Ascension** | Common | `+3 RANK` | Grants +3 rank power to your played card this round. |
| **Vanguard's Edge**| Rare | `BREAK TIE` | If this round ends in a tie, you automatically win. |
| **Royal Decree** | Rare | `TRUMP SUIT` | Specific suit (♠, ♥, ♦, or ♣) beats all other suits regardless of rank. |

---

## 🛠️ Tech Stack & Architecture

* **Backend:** Node.js, Express, Socket.IO, TypeScript.
  * Real-time state synchronization, sequential timed reveal phases, built-in Bot AI.
* **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
  * Interactive 3D card flips, segmented animated energy meter, responsive layout, full sound synthesizer via Web Audio API.
* **Shared:** Unified TypeScript type definitions (`types.ts`) ensuring 100% type safety across client and server.

---

## 🚀 Running the Game Locally

### 1. Install dependencies:
```bash
# In the root folder:
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Start development mode:
```bash
# Starts both Backend (port 3001) and Frontend (port 5173) concurrently:
npm run dev
```

Open your browser to **`http://localhost:5173`**.

### 3. Game Modes:
* **Practice vs AI Bot 🤖:** Test card strategies and bluffing combos immediately without needing a second player.
* **Create 1v1 Room:** Generates a 5-letter room code (e.g., `WAR89`) with 1-click copy link to play with a friend.
* **Join Room:** Enter the 5-letter code to join an existing game room.

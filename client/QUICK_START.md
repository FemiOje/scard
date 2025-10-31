# Quick Start Guide - SCARD Game Client

## 🚀 Get Started in 3 Steps

### 1. Start the Development Server

```bash
cd scard/client
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Connect Your Wallet

- Click **"Connect Cartridge Wallet"**
- Choose authentication method (Google, WebAuthn, etc.)
- Approve the connection

### 3. Play the Game

- Click **"Spawn Player"** to initialize (Position: 10,10, Moves: 100)
- Use arrow buttons to move: ↑ ↓ ← →
- Watch your position and moves update in real-time!

## 🎮 Game Mechanics

### Spawn
- **Action**: Initialize your player
- **Starting Position**: (10, 10)
- **Starting Moves**: 100
- **Cost**: Gas fee (sponsored by session)

### Move
- **Directions**: Up, Down, Left, Right
- **Cost per Move**: 1 move + gas fee
- **Position Changes**:
  - ⬅️ Left: x - 1
  - ➡️ Right: x + 1
  - ⬆️ Up: y - 1
  - ⬇️ Down: y + 1

### Player State
The UI shows:
- 📍 Current Position (x, y)
- 🎯 Remaining Moves
- ✅ Can Move (Yes/No)

## 📂 Key Files

| File | Purpose |
|------|---------|
| `src/starknet-provider.tsx` | Cartridge wallet integration |
| `src/components/GameActions.tsx` | Game actions + entity queries |
| `src/typescript/contracts.gen.ts` | Generated contract bindings |
| `src/typescript/models.gen.ts` | Generated model types |
| `dojoConfig.ts` | World address + RPC config |

## 🔧 Technical Details

### Contract Calls
```typescript
// Spawn
await client.actions.spawn(account);

// Move
const direction = new CairoCustomEnum({ Left: {} });
await client.actions.move(account, direction);
```

### Entity Queries
```typescript
// Get position
const position = await client.getEntity("scard", "Position", [address]);

// Get moves
const moves = await client.getEntity("scard", "Moves", [address]);
```

## 🐛 Troubleshooting

### Wallet Won't Connect
- Check browser console for errors
- Try refreshing the page
- Clear browser cache
- Ensure popup blockers are disabled

### Actions Not Working
- Ensure wallet is connected
- Check you've spawned first
- Verify you have moves remaining
- Check browser console for transaction errors

### State Not Updating
- Wait 2-3 seconds after action
- Check transaction on Starkscan
- Refresh the page
- Check console for query errors

## 🌐 Network Info

- **Network**: Starknet Sepolia Testnet
- **RPC**: `https://api.cartridge.gg/x/starknet/sepolia`
- **World Address**: `0x626a357a9e415e7f16f3ef0bdd406a2536323462e328d3e4604cef106434216`
- **Actions Contract**: `0x404679ea759d1df51e978512971f4d5dc8df79dc6bc3b9906f43230195480ba`

## 📖 Documentation

- [`CARTRIDGE_INTEGRATION.md`](./CARTRIDGE_INTEGRATION.md) - Wallet integration details
- [`ENTITY_QUERIES_GUIDE.md`](./ENTITY_QUERIES_GUIDE.md) - Entity queries + contract calls
- [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) - Complete implementation overview

## 🎉 Features

✅ Cartridge wallet integration  
✅ Session-based authentication  
✅ Multiple login methods  
✅ Contract function calls  
✅ Entity state queries  
✅ Real-time UI updates  
✅ Position tracking  
✅ Move counter  
✅ Error handling  
✅ Loading states  
✅ Profile access  
✅ Settings access  

## 💡 Tips

- Always spawn before moving
- Check remaining moves before actions
- Wait for transactions to complete
- Use console logs to debug
- Test on Sepolia testnet first

## 🚀 Next Features

Ideas for enhancement:
- [ ] Game board visualization
- [ ] Movement history
- [ ] Transaction explorer links
- [ ] Optimistic UI updates
- [ ] Torii real-time subscriptions
- [ ] Multiplayer view
- [ ] Leaderboard
- [ ] Achievements

## 📞 Support

If you encounter issues:
1. Check browser console
2. Review documentation
3. Check contract on Starkscan
4. Verify network connectivity

---

**Enjoy playing SCARD! 🎮**


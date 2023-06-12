<script lang="ts">
	import seedrandom from 'seedrandom';
	import type { Map, Tile, TileResource } from '$lib/map';
	import type { Player } from '$lib/player';
	const rng = seedrandom('8');
	const size = 5;
	const map: Map = {
		tiles: [...new Array(size)].map((row, x) =>
			[...new Array(size)].map((col, y) =>
				rng() < 0.4
					? {
							type: 'resource',
							value: Math.floor(rng() * 100),
							resourceType: rng() < 0.5 ? 'wood' : 'stone',
							pos: { x, y }
					  }
					: { type: 'default', pos: { x, y } }
			)
		)
	};
	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {}
	}

	let curSelection: { x: number; y: number } | null = null;
	$: curTile = curSelection ? map.tiles[curSelection.x][curSelection.y] : null;

	interface GameState {
		day: number;
		players: Player[];
	}

	const initialGameState: GameState = {
		day: 0,
		players: [
			{
				name: 'Player 1',
				team: 'red',
				resources: {
					wood: 0,
					stone: 0
				},
				constructs: {
					spear: 0,
					sword: 0
				},
				pos: { x: 0, y: 0 },
				nextPos: null,
				idleAction: null
			},
			{
				name: 'Player 2',
				team: 'blue',
				resources: {
					wood: 0,
					stone: 0
				},
				constructs: {
					spear: 0,
					sword: 0
				},
				pos: { x: size - 1, y: size - 1 },
				nextPos: null,
				idleAction: null
			}
		]
	};
	let gameState: GameState = initialGameState;

	setInterval(() => {
		for (let i = 0; i < gameState.players.length; i++) {
			const player = gameState.players[i];
			if (player.idleAction === 'wood') {
				gameState.players[i] = {
					...player,
					resources: {
						...player.resources,
						wood:
							player.resources.wood +
							((map.tiles[player.pos.x][player.pos.y] as TileResource).resourceType === 'wood'
								? 2
								: 1)
					}
				};
			}
			if (player.idleAction === 'stone') {
				gameState.players[i] = {
					...player,
					resources: {
						...player.resources,
						stone:
							player.resources.stone +
							((map.tiles[player.pos.x][player.pos.y] as TileResource).resourceType === 'stone'
								? 2
								: 1)
					}
				};
			}
		}
	}, 1000);

	let curPlayer = 0;

	function canMoveTo(curPlayer: Player, pos: { x: number; y: number }) {
		const playerPos = curPlayer.pos;
		return Math.abs(playerPos.x - pos.x) <= 1 && Math.abs(playerPos.y - pos.y) <= 1;
	}

	function posEq(a: { x: number; y: number } | null, b: { x: number; y: number } | null) {
		if (!a || !b) return a === b;
		return a.x === b.x && a.y === b.y;
	}

	function handleTileClick(tile: Tile) {
		if (!canMoveTo(gameState.players[curPlayer], tile.pos)) {
			if (posEq(gameState.players[0].pos, tile.pos)) curPlayer = 0;
			else if (posEq(gameState.players[1].pos, tile.pos)) curPlayer = 1;
			return;
		}
		gameState.players[curPlayer] = { ...gameState.players[curPlayer], nextPos: tile.pos };
	}

	function handleNextDay() {
		gameState.day++;

		for (let i = 0; i < gameState.players.length; i++) {
			gameState.players[i] = {
				...gameState.players[i],
				pos: gameState.players[i].nextPos || gameState.players[i].pos,
				nextPos: null
			};
		}
		gameState = gameState;
	}
	function setAction(action: 'wood' | 'stone' | null, index: number) {
		gameState.players[index] = {
			...gameState.players[index],
			idleAction: action
		};
	}
	function build(name: 'spear' | 'sword') {
		const player = gameState.players[curPlayer];
		if (name === 'spear') {
			gameState.players[curPlayer] = {
				...gameState.players[curPlayer],
				constructs: {
					...player.constructs,
					spear: player.constructs.spear + 1
				},
				resources: {
					...player.resources,
					wood: player.resources.wood - 2
				}
			};
		} else if (name === 'sword') {
			gameState.players[curPlayer] = {
				...gameState.players[curPlayer],
				constructs: {
					...player.constructs,
					sword: player.constructs.sword + 1
				},
				resources: {
					...player.resources,
					stone: player.resources.stone - 2,
					wood: player.resources.wood - 1
				}
			};
		}
	}
</script>

<main>
	<div class="dev">
		<button on:click={() => gameState.day++}>Reset</button>
		Day: {gameState.day} <button on:click={handleNextDay}>Next Day</button>
	</div>
	<section>
		<div>
			<div class="map">
				{#each map.tiles as row}
					<div class="row">
						{#each row as tile}
							<div
								class={`tile ${tile.type === 'resource' ? tile.resourceType : ''}`}
								class:movable={canMoveTo(gameState.players[curPlayer], tile.pos)}
								class:next={posEq(gameState.players[curPlayer].nextPos, tile.pos)}
								on:mouseenter={() => (curSelection = tile.pos)}
								on:mouseleave={() => (curSelection = null)}
								on:click={() => handleTileClick(tile)}
							>
								{posEq(gameState.players[0].pos, tile.pos) ? '🔴' : ''}
								{posEq(gameState.players[1].pos, tile.pos) ? '🔵' : ''}
								<!-- <div class="pos">{tile.pos.x}, {tile.pos.y}</div> -->
							</div>
						{/each}
					</div>
				{/each}
			</div>
			{#if curSelection}
				<div class="curtile">
					<h2>{curTile?.type === 'resource' ? curTile.resourceType : 'empty'}</h2>
				</div>
			{/if}
		</div>
		<div class="players">
			{#each gameState.players as player, i}
				<div class="player">
					<header>
						<h2 class="name">
							{player.name}
							{player.team === 'blue' ? ' 🔵' : ' 🔴'}
							{i === curPlayer ? ' (selected)' : ''}
						</h2>
						<button on:click={() => (curPlayer = i)}>Select</button>
					</header>
					<div class="actions">
						<button on:click={() => setAction('wood', i)}>
							Chop Wood {map.tiles[player.pos.x][player.pos.y].resourceType === 'wood'
								? '(+1)'
								: ''}
						</button>
						<button on:click={() => setAction('stone', i)}>
							Mine Stone {map.tiles[player.pos.x][player.pos.y].resourceType === 'stone'
								? '(+1)'
								: ''}
						</button>
						<button on:click={() => setAction(null, i)}>Idle</button>
						({player.idleAction === 'wood'
							? 'Chopping wood'
							: player.idleAction
							? 'Mining stone'
							: 'idle'})
					</div>
					<div class="construction">
						<button disabled={player.resources.wood < 2} on:click={() => build('spear')}
							>Build Spear (-2 Wood)</button
						>
						<button
							disabled={player.resources.wood < 1 || player.resources.stone < 2}
							on:click={() => build('sword')}>Build Sword (-1 Wood -2 Stone)</button
						>
					</div>
					<div class="resources">
						Wood: {player.resources.wood}
						Stone: {player.resources.stone}
					</div>
					<div class="constructs">
						Spears: {player.constructs.spear}
						Swords: {player.constructs.sword}
					</div>
				</div>
			{/each}
		</div>
	</section>
</main>

<style>
	h2 {
		margin: 0;
		padding: 0;
	}
	.players {
		display: flex;
		gap: 8px;
		flex: 1;
		align-items: flex-start;
	}
	.player {
		padding: 16px;
		border: #ddd solid 1px;
		border-radius: 2px;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.player header {
		display: flex;
		justify-content: space-between;
	}
	.dev {
		padding: 10px 0;
		display: flex;
		gap: 8px;
	}
	main {
		font-family: sans-serif;
	}
	section {
		display: flex;
		gap: 16px;
		max-width: 1400px;
	}
	.map {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.row {
		display: flex;
		gap: 4px;
	}
	.tile {
		display: grid;
		align-items: center;
		justify-items: center;
		/* background: rgb(216, 242, 228); */
		background: #eee;
		width: 50px;
		height: 50px;
		border: #38d 0px solid;
		box-sizing: border-box;
		border-radius: 2px;
		position: relative;
	}
	.tile.movable {
		border: rgb(225, 189, 8) 2px solid;
	}
	.tile.next:after {
		position: absolute;
		content: '';
		top: 17px;
		left: 17px;
		width: 10px;
		height: 10px;
		z-index: 10;
		border-radius: 10px;
		background: rgb(225, 142, 8);
	}
	.tile:hover {
		border: #38d 2px solid;
	}
	.tile.wood {
		background: rgb(203, 174, 140);
	}
	.tile.stone {
		background: #ccc;
	}
</style>

export type Player = {
	name: string;
	team: 'red' | 'blue';
	resources: {
		wood: number;
		stone: number;
	};
	constructs: {
		spear: number;
		sword: number;
	};
	pos: { x: number; y: number };
	nextPos: { x: number; y: number } | null;
	idleAction: 'wood' | 'stone' | null;
};

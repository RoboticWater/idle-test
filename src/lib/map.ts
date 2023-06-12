type Override<T, U> = Omit<T, keyof U> & U;

export type TileDefault = {
	pos: {
		x: number;
		y: number;
	};
	type: 'default';
};

export type TileResource = Override<
	TileDefault,
	{
		resourceType: 'wood' | 'stone';
		value: number;
		type: 'resource';
	}
>;

export type Tile = TileDefault | TileResource;

export type Map = {
	tiles: Tile[][];
};

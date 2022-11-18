game.engine.sendAction({
	$case: "mapAddObject",
	mapAddObject: { 
		mapId: 'blank',
		object: {
			_name: 'Great Red Wyrm',
			_tags: 'gif-obj',
			x: 32,
			y: 45,
			normal: 'https://raw.githubusercontent.com/Ex-hax/Leunited/master/obj/sprite_sheet/dragon01/Animations/Great%20Red%20Wyrm/Greate%20Red%20Wyrm.png',
			highlighted: 'https://raw.githubusercontent.com/Ex-hax/Leunited/master/obj/sprite_sheet/dragon01/Animations/Great%20Red%20Wyrm/Greate%20Red%20Wyrm.png',
			type: 0,
			distThreshold : 2,
			width: 1,
			height: 1,
			id: 'Great Red Wyrm-01',
			spritesheet: {
				spritesheetUrl: 'https://raw.githubusercontent.com/hmm-yess/Leunited/master/obj/sprite_sheet/dragon01/Animations/Great%20Red%20Wyrm/Greate%20Red%20Wyrm.png',
				animations: {
						'idle-s': {
							sequence: [ 0, 7 ],
							frameRate: 8,
							useSequenceAsRange: true,
							loop: true
						},
				},
				framing: { 
					frameWidth: 32, frameHeight: 32
				},
				currentAnim: 'idle-s'
			},
		}
	}
});

game.engine.sendAction({
	$case: "mapAddObject",
	mapAddObject: { 
		mapId: 'blank',
		object: {
			_name: 'speed-buff',
			_tags: [ 'buff-obj', 'buff-speed' ],
			normal: 'https://raw.githubusercontent.com/Ex-hax/Leunited/master/obj/img/target/candy.png',
			highlighted: 'https://raw.githubusercontent.com/Ex-hax/Leunited/master/obj/img/target/candy.png',
			type: 5,
			x: 27,
			y: 63,
			width: 1,
			height: 1,
			distThreshold : 1,
			id: "speed-buff-01",
			previewMessage: "speed-buff",
		},
	}
});

game.engine.sendAction({
	$case: 'setImpassable',
	setImpassable: {
		mapId: 'blank',
		x: 57,
		y: 44,
		impassable: true,
	}
});
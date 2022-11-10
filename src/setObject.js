game.engine.sendAction({
	$case: "mapAddObject",
	mapAddObject: { 
		mapId: 'blank',
		object: {
			_name: 'Great Red Wyrm',
			_tags: 'gif-obj',
			x: 50,
			y: 57,
			normal: 'https://raw.githubusercontent.com/hmm-yess/Leunited/master/obj/sprite_sheet/dragon01/Animations/Great%20Red%20Wyrm/Greate%20Red%20Wyrm.png',
			highlighted: 'https://raw.githubusercontent.com/hmm-yess/Leunited/master/obj/sprite_sheet/dragon01/Animations/Great%20Red%20Wyrm/Greate%20Red%20Wyrm.png',
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
			_name: "custom-door",
			_tags: ['custom-door'],
			normal: "https://raw.githubusercontent.com/Ex-hax/Leunited/master/obj/img/GatherDoor/Door-close-hl.png",
			highlighted: "https://raw.githubusercontent.com/Ex-hax/Leunited/master/obj/img/GatherDoor/Door-close-hl.png",
			type: 5,
			x: 35,
			y: 49,
			width: 2,
			height: 1,
			id: "custom-door-01",
			previewMessage: "press x to open door",
		},
	}
});

game.engine.sendAction({
	$case: 'setImpassable',
	setImpassable: {
		mapId: 'blank',
		x:,
		y:,
		impassable: true;
	}
});
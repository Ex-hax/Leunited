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
			_name: 'event-keeper',
			_tags: ['event-keeper'],
			x: 52,
			y: 59,
			normal: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/uploads/UnQOIUo2ehN62TEU/N4lx1VcXRo7fmJSwIFY8eE',
			highlighted: 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/uploads/UnQOIUo2ehN62TEU/l3aZRSeoj42KgJUTs69vwO',
			type: 5,
			distThreshold: 2,
			previewMessage: `To join an event, please find the event teleporter`,
			width: 1,
			height: 2,
			id: 'event-keeper-01',
		}
	}
});
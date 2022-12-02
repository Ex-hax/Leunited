//https://gather.town/api/getMap?spaceId=VJ01mwNnpyXsL76g\\Leunited&mapId=rootstown-office-main&apiKey=CqJ8NIBnx3VZlDIQ
const { Game } = require("@gathertown/gather-game-client");
const game = new Game('VJ01mwNnpyXsL76g\\Leunited', () => Promise.resolve({ apiKey: 'CqJ8NIBnx3VZlDIQ' }));
global.WebSocket = require("isomorphic-ws");
game.connect();
game.subscribeToConnection((connected) => console.log("\nconnected?", connected));

game.enter(
		{
			name: 'Guild Master',
			textStatus: 'Type /help to see more details.',
			map: 'blank',
			x: 28,
			y: 43,
			isNpc: true
		},
		'pdZnTdb7VShWtOz6F2xdVAJ4nOs2'
	);

/* var declare for dead by gather event*/

var killer_id = []; // example myself
var players_join = [];
var sur_win_percent = 0;

const check_point = [{'x':55,'y':77},{'x':47,'y':68},{'x':35,'y':37},{'x':84,'y':27},{'x':85,'y':6}];
const fall_back = [{'x':55,'y':78},{'x':47,'y':67},{'x':35,'y':36},{'x':85,'y':28},{'x':85,'y':7}];

var gens = [
		{'gen_a':0, 'id':'gen_a', 'is_trigger': false, 'is_break': false},
		{'gen_b':0, 'id':'gen_b', 'is_trigger': false, 'is_break': false},
		{'gen_c':0, 'id':'gen_c', 'is_trigger': false, 'is_break': false},
		{'gen_d':0, 'id':'gen_d', 'is_trigger': false, 'is_break': false},
		{'gen_e':0, 'id':'gen_e', 'is_trigger': false, 'is_break': false},
	];

var is_event_start = false;
/**/

game.subscribeToEvent('playerJoins',(data,context) => {
	if (game.players[context.playerId].isNpc != true){
		if ((game.players[context.playerId]['affiliation'] != '' || game.players[context.playerId]['affiliation'] == '') && game.players[context.playerId]['description'] == ''){
			var old_player_info = JSON.stringify({HP:100, MANA:100, L$:100});
			game.setDescription(old_player_info,context.playerId);
		}
		game.engine.sendAction({
		$case: "chat",
			chat: { 
				chatRecipient: context.playerId,
				contents: `Hello this is Guild Master.
				Type /help to see more details.`,
				localPlayerIds: [],
				mapId: 'blank',
			}
		});
	}
});

game.subscribeToEvent("playerMoves", (data, context) => {
	var pid = context.playerId;
	var player_affiliation = context.player.affiliation;
	var res_pos = [{'x':48, 'y':63}, {'x':48, 'y':64}, {'x':48, 'y':65},]
	for (var i = 0; i<res_pos.length; i++){
		if (data.playerMoves.x == res_pos[i]['x'] && data.playerMoves.y == res_pos[i]['y']){
			if (player_affiliation != 'ally'){
				game.teleport('blank',50,72,pid);
				game.engine.sendAction({
					$case: "chat",
						chat: { 
							chatRecipient: context.playerId,
							contents: 'Look like you are not our ally?',
							localPlayerIds: [],
							mapId: 'blank',
						}
				});
				break;
			}
		}	
	}
});

game.subscribeToEvent("playerChats", (data, context) => {
	const message = data.playerChats;
	if (message.messageType === "DM") {
		switch (message.contents.toLowerCase()) {
			case "/help":
				game.engine.sendAction({
					$case: "chat",
						chat: { 
							chatRecipient: data.playerChats.senderId,
							contents: `1. To be our guild member type /regis.
							2. Type /leave for left guild.
							3. Type /info to get player info.`,
							localPlayerIds: [],
							mapId: 'blank',
						}
				});
				break;
			case "/regis":
				if (context.player.affiliation != 'ally'){
					game.setAffiliation('ally',data.playerChats.senderId);
					var new_player_info = JSON.stringify({HP:100, MANA:100, L$:100});
					game.setDescription(new_player_info,data.playerChats.senderId);
					game.notify(`${context?.player?.name ?? context.playerId} join Leunited!!`);
					game.engine.sendAction({
						$case: "chat",
							chat: { 
								chatRecipient: data.playerChats.senderId,
								contents: `Successful register!
								Welcome to our guild.
								HP: 100 MANA: 100 L$: 100`,
								localPlayerIds: [],
								mapId: 'blank',
							}
					});
				}
				else {
					game.engine.sendAction({
						$case: "chat",
							chat: { 
								chatRecipient: data.playerChats.senderId,
								contents: 'You have been our guild member!',
								localPlayerIds: [],
								mapId: 'blank',
							}
					});
				}
				break;
			case "/info":
				if (game.players[data.playerChats.senderId]['affiliation'] != ''){
					var p_info_request = game.players[data.playerChats.senderId]['description'];
					p_info_request = JSON.parse(p_info_request);
					game.engine.sendAction({
						$case: "chat",
							chat: { 
								chatRecipient: data.playerChats.senderId,
								contents: `ID: ${data.playerChats.senderId}
								HP: ${p_info_request['HP']}
								MANA: ${p_info_request['MANA']}
								L$: ${p_info_request['L$']}`,
								localPlayerIds: [],
								mapId: 'blank',
							}
					});
				}
				else {
					game.engine.sendAction({
						$case: "chat",
							chat: { 
								chatRecipient: data.playerChats.senderId,
								contents: `Please register ❗`,
								localPlayerIds: [],
								mapId: 'blank',
							}
					});
				}
				break;
			case "/market":
				game.engine.sendAction({
					$case: "chat",
						chat: { 
							chatRecipient: data.playerChats.senderId,
							contents: `Welcome to our guild market place!
							To receive buff press x
							1. Speed-buff: cost 20 L$.
							2. Teleport to gate: cost 50 L$.`,
							localPlayerIds: [],
							mapId: 'blank',
						}
				});
				break;
			case "/leave":
				game.setAffiliation('',data.playerChats.senderId);
				game.setDescription('',data.playerChats.senderId);
				game.engine.sendAction({
					$case: "chat",
						chat: { 
							chatRecipient: data.playerChats.senderId,
							contents: `You are not guild member for now
							1. Your HP MANA and L$ will reset to default.
							2. you will lose all progress and items.`,
							localPlayerIds: [],
							mapId: 'blank',
						}
				});
				game.teleport('blank',50,72,data.playerChats.senderId);
				break;
			case "/start":
				if (is_event_start == false){
					if (game.players[data.playerChats.senderId]['map'] == 'RdrF5O3qyQ91gFAdofHTv'){
						const all_pid_key_join = Object.keys(game.players);
						for (var i=0;i<all_pid_key_join.length;i++){
							if (game.players[all_pid_key_join[i]]['map'] == 'RdrF5O3qyQ91gFAdofHTv'){
								if (killer_id.length == 0 && !killer_id.includes(data.playerChats.senderId)){
									killer_id.push(data.playerChats.senderId);
									game.teleport('RdrF5O3qyQ91gFAdofHTv',82,9,data.playerChats.senderId);
									game.setSpeedModifier(2,data.playerChats.senderId);
									console.log(killer_id);
									if (data.playerChats.senderId == all_pid_key_join[i]){
										console.log('Already added.');
									}
									else{
										players_join.push(all_pid_key_join[i]);
									}
								}
								else {
									if(killer_id.includes(all_pid_key_join[i]) == false){
										players_join.push(all_pid_key_join[i]);
										game.setSpeedModifier(1,all_pid_key_join[i]);
										game.teleport('RdrF5O3qyQ91gFAdofHTv',50,50,all_pid_key_join[i]);
										console.log(players_join);
									}
									
								}
							}
						}
						if (players_join.length == 0){
							killer_id = [];
							game.setSpeedModifier(1,data.playerChats.senderId);
							game.teleport('RdrF5O3qyQ91gFAdofHTv',50,50,data.playerChats.senderId);
							game.engine.sendAction({
								$case: "chat",
									chat: { 
										chatRecipient: data.playerChats.senderId,
										contents: `The game can't start due to 
										no survivor. Please wait for another
										or can leave by respawn.`,
										localPlayerIds: [],
										mapId: 'RdrF5O3qyQ91gFAdofHTv',
									}
							});
						}
						else{
							is_event_start = true;
							sur_win_percent = players_join.length + killer_id.length;
							if (sur_win_percent > 500){
								sur_win_percent = 500;
							}
						}
					}
				}
				else {
					console.log('Event has been started.');
					game.engine.sendAction({
					$case: "chat",
						chat: { 
							chatRecipient: data.playerChats.senderId,
							contents: `Event has been started.`,
							localPlayerIds: [],
							mapId: 'blank',
						}
					});
				}
				break;
			case "/stop":
				killer_id = [];
				players_join = [];
				gens = [
					{'gen_a':0, 'id':'gen_a', 'is_trigger': false, 'is_break': false},
					{'gen_b':0, 'id':'gen_b', 'is_trigger': false, 'is_break': false},
					{'gen_c':0, 'id':'gen_c', 'is_trigger': false, 'is_break': false},
					{'gen_d':0, 'id':'gen_d', 'is_trigger': false, 'is_break': false},
					{'gen_e':0, 'id':'gen_e', 'is_trigger': false, 'is_break': false},
				];
				const all_pid_key_left = Object.keys(game.players);
				for (var i=0;i<all_pid_key_left.length;i++){
					if(game.players[all_pid_key_left[i]]['map'] == 'RdrF5O3qyQ91gFAdofHTv'){
						game.teleport('blank',56,44,all_pid_key_left[i]);
						game.setSpeedModifier(1,all_pid_key_left[i]);
					}
				}
				is_event_start = false;
				break;
			default:
				game.engine.sendAction({
					$case: "chat",
						chat: { 
							chatRecipient: data.playerChats.senderId,
							contents: 'What do you mean?',
							localPlayerIds: [],
							mapId: 'blank',
						}
				});
		}
	}
});

game.subscribeToEvent("playerInteracts", (data, context) => {
	var obj = game.partialMaps.blank.objects;
	var obj_key = Object.keys(obj);
	for (var i = 0; i<obj_key.length;i++){
		if(data.playerInteracts.objId == obj[obj_key[i]].id){
			console.log(obj[obj_key[i]]._tags);
			if (obj[obj_key[i]]._tags !== undefined){
				if(obj[obj_key[i]]._tags.includes('buff-speed')){
					var p_info_speed = game.players[context.playerId]['description'];
					p_info_speed = JSON.parse(p_info_speed);
					if (p_info_speed['L$'] < 20){
						game.engine.sendAction({
						$case: "chat",
							chat: { 
								chatRecipient: context.playerId,
								contents: `You need more ${20-p_info_speed['L$']} L$ to purchase this buff.`,
								localPlayerIds: [],
								mapId: 'blank',
							}
						});
					}
					else {
						p_info_speed['L$'] -= 20;
						game.setDescription(JSON.stringify(p_info_speed),context.playerId);
						game.engine.sendAction({
						$case: "chat",
							chat: { 
								chatRecipient: context.playerId,
								contents: `Your remaining balance is ${p_info_speed['L$']} L$.`,
								localPlayerIds: [],
								mapId: 'blank',
							}
						});
						console.log(obj[obj_key[i]]._tags);
						game.setSpeedModifier(3,context.playerId);
						setTimeout(()=>{
							game.setSpeedModifier(1,context.playerId);
						},30000);
					}
				}	
				else if (obj[obj_key[i]]._tags.includes('buff-teleporter')){
					var p_info_tele = game.players[context.playerId]['description'];
					p_info_tele = JSON.parse(p_info_tele);
					if (p_info_tele['L$'] < 50){
						game.engine.sendAction({
						$case: "chat",
							chat: { 
								chatRecipient: context.playerId,
								contents: `You need more ${50-p_info_tele['L$']} L$ to purchase this buff.`,
								localPlayerIds: [],
								mapId: 'blank',
							}
						});
					}
					else {
						p_info_tele['L$'] -= 50;
						game.setDescription(JSON.stringify(p_info_tele),context.playerId);
						game.engine.sendAction({
						$case: "chat",
							chat: { 
								chatRecipient: context.playerId,
								contents: `Your remaining balance is ${p_info_tele['L$']} L$.`,
								localPlayerIds: [],
								mapId: 'blank',
							}
						});
						console.log(obj[obj_key[i]]._tags);
						game.teleport('blank',53,95,context.playerId);
					}
					
				}
				else if (obj[obj_key[i]]._tags.includes('event-teleporter')){
					if (is_event_start == false){
						console.log(obj[obj_key[i]]._tags);
						game.teleport('RdrF5O3qyQ91gFAdofHTv',50,50,context.playerId);
					}
					else {
						game.engine.sendAction({
						$case: "chat",
							chat: { 
								chatRecipient: context.playerId,
								contents: `Event has been started.`,
								localPlayerIds: [],
								mapId: 'blank',
							}
						});
						console.log(`Event has been started.`);
					}
				}
				else {
					console.log('No _tags match.');
				}
			}
		}
	}
	//console.log(game.partialMaps.blank.objects[String(data.playerInteracts.encId)]._tags);
	/*if (data.playerInteracts.objId == 'guard-sm'){
		game.engine.sendAction({
			$case: "mapDeleteObjectById",
				mapDeleteObjectById: { 
					id: data.playerInteracts.objId,
					mapId: 'blank',
				}
		});
	}*/
});

setInterval(()=>{
	if (game.partialMaps.blank.backgroundImagePath == 'https://raw.githubusercontent.com/Ex-hax/Leunited/master/map/main-dark.png'){
		game.engine.sendAction({
			$case: "mapSetBackgroundImagePath",
			mapSetBackgroundImagePath:{
				mapId: 'blank',
				backgroundImagePath: 'https://raw.githubusercontent.com/Ex-hax/Leunited/master/map/main.png',
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
	}
	else {
		game.engine.sendAction({
			$case: "mapSetBackgroundImagePath",
			mapSetBackgroundImagePath:{
				mapId: 'blank',
				backgroundImagePath: 'https://raw.githubusercontent.com/Ex-hax/Leunited/master/map/main-dark.png',
			}
		});
		game.engine.sendAction({
			$case: 'setImpassable',
			setImpassable: {
				mapId: 'blank',
				x: 57,
				y: 44,
				impassable: false,
			}
		});
		setTimeout(()=>{
			game.engine.sendAction({
				$case: 'setImpassable',
				setImpassable: {
					mapId: 'blank',
					x: 57,
					y: 44,
					impassable: true,
				}
			});
			game.engine.sendAction({
				$case: "mapSetBackgroundImagePath",
				mapSetBackgroundImagePath:{
					mapId: 'blank',
					backgroundImagePath: 'https://raw.githubusercontent.com/Ex-hax/Leunited/master/map/main.png',
				}
			});
		},7000);
	}
},600000);

/***************************************************************************/
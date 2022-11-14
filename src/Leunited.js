//https://gather.town/api/getMap?spaceId=VJ01mwNnpyXsL76g\\Leunited&mapId=rootstown-office-main&apiKey=CqJ8NIBnx3VZlDIQ
const { Game } = require("@gathertown/gather-game-client");
const game = new Game('VJ01mwNnpyXsL76g\\Leunited', () => Promise.resolve({ apiKey: 'CqJ8NIBnx3VZlDIQ' }));
global.WebSocket = require("isomorphic-ws");
game.connect();
game.subscribeToConnection((connected) => console.log("connected?", connected));

game.enter({isNpc:true},'pdZnTdb7VShWtOz6F2xdVAJ4nOs2')

/* var declare for dead by gather event*/

var killer_id = []; // example myself
var players_join = [];
//const all_pid_key = Object.keys(game.players);
const check_point = [{'x':55,'y':77},{'x':47,'y':68},{'x':35,'y':37},{'x':84,'y':27},{'x':85,'y':6}];
const fall_back = [{'x':55,'y':78},{'x':47,'y':67},{'x':35,'y':36},{'x':85,'y':28},{'x':85,'y':7}];

var gens = [
	{'gen_a':0, 'tags': 'gen_a'},
	{'gen_b':0, 'tags': 'gen_b'},
	{'gen_c':0, 'tags': 'gen_c'},
	{'gen_d':0, 'tags': 'gen_d'},
	{'gen_e':0, 'tags': 'gen_e'},
	];

var is_event_start = false;
/**/

game.subscribeToEvent('playerJoins',(data,context) => {
	if (game.players[context.playerId].isNpc != true){
		game.engine.sendAction({
		$case: "chat",
			chat: { 
				chatRecipient: context.playerId,
				contents: `Hello this is badmin bot.
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
							3. Type /id to get your player id.`,
							localPlayerIds: [],
							mapId: 'blank',
						}
				});
				break;
			case "/regis":
				if (context.player.affiliation != 'ally'){
					game.setAffiliation('ally',data.playerChats.senderId);
					game.notify(`${context?.player?.name ?? context.playerId} join Leunited!!`);
					game.engine.sendAction({
						$case: "chat",
							chat: { 
								chatRecipient: data.playerChats.senderId,
								contents: `Successful register!
								Welcome to our guild.`,
								localPlayerIds: [],
								mapId: 'blank',
							}
					});
				}
				else{
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
			case "/id":
				game.engine.sendAction({
					$case: "chat",
						chat: { 
							chatRecipient: data.playerChats.senderId,
							contents: `Your id is ${data.playerChats.senderId}`,
							localPlayerIds: [],
							mapId: 'blank',
						}
				});
				break;
			case "/market":
				game.engine.sendAction({
					$case: "chat",
						chat: { 
							chatRecipient: data.playerChats.senderId,
							contents: `Welcome to our guild market place!
							To receive buff press x
							1. Speed-buff: cost 20 recoin
							2. Teleport to gate: cost 50 recoin`,
							localPlayerIds: [],
							mapId: 'blank',
						}
				});
				break;
			case "/leave":
				game.setAffiliation('',data.playerChats.senderId);
				game.engine.sendAction({
					$case: "chat",
						chat: { 
							chatRecipient: data.playerChats.senderId,
							contents: 'You are not guild member for now.',
							localPlayerIds: [],
							mapId: 'blank',
						}
				});
				game.teleport('blank',50,72,data.playerChats.senderId);
				break;
			case "/start":
				if (is_event_start == false){
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
					is_event_start = true;
				}
				else{
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
					{'gen_a':0, 'tags': 'gen_a'},
					{'gen_b':0, 'tags': 'gen_b'},
					{'gen_c':0, 'tags': 'gen_c'},
					{'gen_d':0, 'tags': 'gen_d'},
					{'gen_e':0, 'tags': 'gen_e'},
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
			if(obj[obj_key[i]]._tags.includes('buff-speed')){
				console.log(obj[obj_key[i]]._tags);
				game.setSpeedModifier(3,context.playerId);
				setTimeout(()=>{
					game.setSpeedModifier(1,context.playerId);
				},30000);
			}
			else if(obj[obj_key[i]]._tags.includes('buff-teleporter')){
				console.log(obj[obj_key[i]]._tags);
				game.teleport('blank',53,95,context.playerId);
			}
			else if(obj[obj_key[i]]._tags.includes('event-teleporter')){
				if (is_event_start == false){
					console.log(obj[obj_key[i]]._tags);
					game.teleport('RdrF5O3qyQ91gFAdofHTv',50,50,context.playerId)
				}
				else{
					game.engine.sendAction({
					$case: "chat",
						chat: { 
							chatRecipient: data.playerChats.senderId,
							contents: `Event has been started.`,
							localPlayerIds: [],
							mapId: 'blank',
						}
					});
					console.log(`Event has been started.`);
				}
			}
			else{
				console.log('No _tags match.');
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
	else{
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
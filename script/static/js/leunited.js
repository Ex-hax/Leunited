const {webhook_api, space_id, map_blank, map_dbg, gatherTown_token, gatherTown_botId, gatherEventGuardNormal, gatherEventGuardHighLight} = require('./config.js');
const request = require('request');
const { Game } = require("@gathertown/gather-game-client");
const game = new Game(space_id, () => Promise.resolve({ apiKey: gatherTown_token }));
global.WebSocket = require("isomorphic-ws");
game.connect();
game.subscribeToConnection((connected) => console.log("\nConnected to GS?", connected));
var socket = require('socket.io-client')(webhook_api,{reconnection: true});
socket.on('connect', () => {
	console.log('Connected to SIO?', true);
});
socket.on('disconnect', () => {
	console.log('Connected to SIO?', false);
});

game.enter(
		{
			name: 'Guild Master',
			textStatus: 'Type /help to see more details.',
			map: map_blank,
			x: 28,
			y: 43,
			isNpc: true
		},
		gatherTown_botId
	);
	
/*action chat*/
const player_chat = (chatRecipient,chatContents,chatMapId) => {
	game.engine.sendAction({
		$case: "chat",
			chat: { 
				chatRecipient: chatRecipient,
				contents: chatContents,
				localPlayerIds: [],
				mapId: chatMapId,
			}
	});	
}

const cre_upd_users = (playerID,playerName) => {
	request(
		{
			method:'get',
			url: `${webhook_api}/api/${playerID}/${playerName}`,
		},(error, response, body)=>{
		//console.log(error);
		//console.log(response);
		console.log(body);
		if (response.statusCode === 200){
			player_chat(
				playerID,
				`Successful register!
				Welcome to our guild.
				HP: 100 MANA: 100 L$: 100`,
				map_blank
			)
		}
	});
};

const send_chat = (sender_gather_name,receipt_line_id,message_text) => {
	return new Promise((resolve, reject) => {
		request(
			{
				method:'post',
				url: `${webhook_api}/api/sendchat`,
				headers: {'content-type' : 'application/json'},
				body: JSON.stringify({
					'sender_gather_name': sender_gather_name,
					'receipt_line_id': receipt_line_id,
					'message_text': message_text,
				})
			},(error, response, body)=>{
			//console.log(error);
			//console.log(response);
			//console.log(body);
			resolve(body);				
		});
	})
}

const get_list = () => {
	return new Promise((resolve, reject) => {
		request(
			{
				method:'get',
				url: `${webhook_api}/api/getlist`,
			},(error, response, body)=>{
			//console.log(error);
			//console.log(response);
			//console.log(body);
			resolve(body);				
		});
	});
};

const send_chat_request = async(case_message_player_chat_id,sender_gather_id,message_text) => {
	var sender_id = [];
	var json_body = JSON.parse(await get_list());
	for ( var i=0; i<json_body['L2G'].length;i++){
		sender_id.push(`${i+1}`);
	}
	// check is registor LineOA
	if (sender_id.includes(case_message_player_chat_id)){
		var line_sender_id = json_body['L2G'][parseInt(case_message_player_chat_id)-1][case_message_player_chat_id]['line_id']
	}
	else{
		var line_sender_id = '';
	}
	if (case_message_player_chat_id != '' && sender_id.includes(case_message_player_chat_id)){
			if(line_sender_id != ''){
				await send_chat(
					game.players[sender_gather_id].name,
					case_message_player_chat_id,
					message_text.replace(`/@${case_message_player_chat_id}`,'')
				)
			}
			else{
				player_chat(
					sender_gather_id,
					`You can\'t send message to non-registor LineOA player!!!`,
					map_blank
				);
			}
		}
	else{
		player_chat(
			sender_gather_id,
			'Please fill the correct player\' s id!!!',
			map_blank
		);
	}
}

const get_list_request = async(receipt_gather_id) => {
	var current_data_list = JSON.parse(await get_list());
	if (current_data_list['L2G'].length != 0){
		var send_data = 'ID, Name,\t\tGatherTownID\n'
			for (var i = 0; i<current_data_list['L2G'].length; i++){
				send_data += `${i+1}, ${current_data_list['L2G'][i][i+1]['standard_name']}\n`
		}
		player_chat(
			receipt_gather_id,
			send_data,
			map_blank
		);
	}
	else{
		player_chat(
			receipt_gather_id,
			'Player\'s data not available for now.',
			map_blank
		);
	}
}
// sender gather_id receive from flask server
socket.on('message', (data) => {
	var new_data = JSON.parse(data);
	if (new_data['case'] == '/message'){
		player_chat(
			new_data['receipt_gather_id'],
			`
			#############
			${new_data['sender_line_display_name']} =>
			${new_data['message_text']}
			#############`,
			map_blank
		);
	}
});

var GatherEventGuardNormal = gatherEventGuardNormal;
var GatherEventGuardHighLight = gatherEventGuardHighLight;

/* var declare for dead by gather event*/
var killer_id = []; // example myself
var players_join = [];
var sur_win_percent = 0;

const check_point = [{'x':55,'y':77},{'x':47,'y':68},{'x':35,'y':37},{'x':84,'y':27},{'x':85,'y':6}];
const fall_back = [{'x':55,'y':78},{'x':47,'y':67},{'x':35,'y':36},{'x':85,'y':28},{'x':85,'y':7}];

var gens = [
		{'id': 'gen_a', 'gen_a': 0, 'is_trigger': false, 'is_break': false},
		{'id': 'gen_b', 'gen_b': 0, 'is_trigger': false, 'is_break': false},
		{'id': 'gen_c', 'gen_c': 0, 'is_trigger': false, 'is_break': false},
		{'id': 'gen_d', 'gen_d': 0, 'is_trigger': false, 'is_break': false},
		{'id': 'gen_e', 'gen_e': 0, 'is_trigger': false, 'is_break': false},
	];

var is_event_start = false;
/**/

game.subscribeToEvent('playerJoins',(data,context) => {
	if (context.playerId != gatherTown_botId){
		player_chat(
			context.playerId,
			`Hello this is Guild Master.
			Type /help to see more details.`,
			map_blank
		);
	}
});

game.subscribeToEvent("playerMoves", (data, context) => {
	var pid = context.playerId;
	var player_affiliation = context.player.affiliation;
	var res_pos = [{'x':48, 'y':63}, {'x':48, 'y':64}, {'x':48, 'y':65},]
	for (var i = 0; i<res_pos.length; i++){
		if (data.playerMoves.x == res_pos[i]['x'] && data.playerMoves.y == res_pos[i]['y']){
			if (player_affiliation != 'ally'){
				game.teleport(map_blank,50,72,pid);
				player_chat(context.playerId,'Look like you are not our ally?',map_blank);
				break;
			}
		}	
	}
});

game.subscribeToEvent("playerChats", (data, context) => {
	if (context.playerId != gatherTown_botId){
		const message = data.playerChats;
		const case_message = message.contents.toLowerCase().split(' ',1);
		const case_message_player_chat_id = case_message[0].replace('/@','');
		if (message.messageType === "DM") {
			switch (case_message[0]) {
				case "/help":
					player_chat(
						data.playerChats.senderId,
						`1. To be our guild member type /regis.
						2. Type /leave for left guild.
						3. Type /info to get player info.
						4. New Feature GatherTown To LineOA
						4.1 If you are new in this room you
						do follow this instruction by
						I. Type /regis and then 
						/info COPY your gather ID
						II. Add freind @624zuzhu
						III. In LineOA type
						/regis <your gather id>
						IV Type /getlist in both to
						see the id that you need to send
						message to /@<id> <your message>
						4.2 For old member type /leave
						and then follow 4.1 topic.
						`,
						map_blank
					);
					break;
				case "/regis":
					if (context.player.affiliation != 'ally'){
						game.setAffiliation('ally',data.playerChats.senderId);
						var new_player_info = JSON.stringify({HP:100, MANA:100, L$:100});
						game.setDescription(new_player_info,data.playerChats.senderId);
						game.notify(`${context?.player?.name ?? context.playerId} join Leunited!!`);
						cre_upd_users(data.playerChats.senderId,context.player.name);
					}
					else {
						player_chat(data.playerChats.senderId,'You have been our guild member!',map_blank);
					}
					break;
				case "/info":
					if (game.players[data.playerChats.senderId]['affiliation'] != ''){
						var p_info_request = game.players[data.playerChats.senderId]['description'];
						p_info_request = JSON.parse(p_info_request);
						player_chat(
							data.playerChats.senderId,
							`GatherTown ID: ${data.playerChats.senderId}
							HP: ${p_info_request['HP']}
							MANA: ${p_info_request['MANA']}
							L$: ${p_info_request['L$']}`,
							map_blank
						);
					}
					else {
						player_chat(data.playerChats.senderId,'Please register ❗',map_blank);
					}
					break;
				case "/getlist":
					get_list_request(data.playerChats.senderId);
					break;
				case `/@${case_message_player_chat_id}`:
					send_chat_request(case_message_player_chat_id,data.playerChats.senderId,message.contents);
					break;
				case "/market":
					player_chat(
						data.playerChats.senderId,
						`Welcome to our guild market place!
						To receive buff press x
						1. Speed-buff: cost 20 L$.
						2. Teleport to gate: cost 50 L$.`,
						map_blank
					);
					break;
				case "/leave":
					game.setAffiliation('',data.playerChats.senderId);
					game.setDescription('',data.playerChats.senderId);
					player_chat(
						data.playerChats.senderId,
						`You are not guild member for now
						1. Your HP MANA and L$ will reset to default.
						2. you will lose all progress and items.`,
						map_blank
					);
					game.teleport(map_blank,50,72,data.playerChats.senderId);
					break;
				case "/start":
					if (is_event_start == false){
						if (game.players[data.playerChats.senderId]['map'] == map_dbg){
							const all_pid_key_join = Object.keys(game.players);
							for (var i=0;i<all_pid_key_join.length;i++){
								if (game.players[all_pid_key_join[i]]['map'] == map_dbg){
									if (killer_id.length == 0 && !killer_id.includes(data.playerChats.senderId)){
										killer_id.push(data.playerChats.senderId);
										game.teleport(map_dbg,82,9,data.playerChats.senderId);
										game.setSpeedModifier(2,data.playerChats.senderId);
										
										if (data.playerChats.senderId == all_pid_key_join[i]){
											console.log('Already added.');
										}
										else{
											players_join.push(all_pid_key_join[i]);
											game.setSpeedModifier(1,all_pid_key_join[i]);
											game.teleport(map_dbg,50,50,all_pid_key_join[i]);
										}
									}
									else {
										if(killer_id.includes(all_pid_key_join[i]) == false){
											players_join.push(all_pid_key_join[i]);
											game.setSpeedModifier(1,all_pid_key_join[i]);
											game.teleport(map_dbg,50,50,all_pid_key_join[i]);
										}
										
									}
								}
							}
							if (players_join.length == 0){
								killer_id = [];
								game.setSpeedModifier(1,data.playerChats.senderId);
								game.teleport(map_dbg,50,50,data.playerChats.senderId);
								player_chat(
									data.playerChats.senderId,
									`The game can't start due to 
									no survivor. Please wait for another
									or can leave by respawn.`,
									map_dbg
								);
							}
							else{
								is_event_start = true;
								sur_win_percent = (players_join.length + killer_id.length) * 100;
								if (sur_win_percent > 500){
									sur_win_percent = 500;
								}
							}
						}
					}
					else {
						player_chat(data.playerChats.senderId,'Event has been started.',map_blank);
					}
					break;
				case "/stop":
					killer_id = [];
					players_join = [];
					gens = [
						{'id': 'gen_a', 'gen_a': 0, 'is_trigger': false, 'is_break': false},
						{'id': 'gen_b', 'gen_b': 0, 'is_trigger': false, 'is_break': false},
						{'id': 'gen_c', 'gen_c': 0, 'is_trigger': false, 'is_break': false},
						{'id': 'gen_d', 'gen_d': 0, 'is_trigger': false, 'is_break': false},
						{'id': 'gen_e', 'gen_e': 0, 'is_trigger': false, 'is_break': false},
					];
					const all_pid_key_left = Object.keys(game.players);
					for (var i=0;i<all_pid_key_left.length;i++){
						if(game.players[all_pid_key_left[i]]['map'] == map_dbg){
							game.teleport(map_blank,56,44,all_pid_key_left[i]);
							game.setSpeedModifier(1,all_pid_key_left[i]);
						}
					}
					is_event_start = false;
					break;
				default:
					player_chat(data.playerChats.senderId,'What do you mean?',map_blank);
			}
		}
	}
});

game.subscribeToEvent("playerInteracts", (data, context) => {
	var obj = game.partialMaps[map_blank]['objects'];
	var obj_key = Object.keys(obj);
	for (var i = 0; i<obj_key.length;i++){
		if(data.playerInteracts.objId == obj[obj_key[i]].id){
			if (obj[obj_key[i]]._tags !== undefined){
				if(obj[obj_key[i]]._tags.includes('buff-speed')){
					var p_info_speed = game.players[context.playerId]['description'];
					p_info_speed = JSON.parse(p_info_speed);
					if (p_info_speed['L$'] < 20){
						player_chat(
							context.playerId,
							`You need more ${20-p_info_speed['L$']} L$ to purchase this buff.`,
							map_blank
						);
					}
					else {
						p_info_speed['L$'] -= 20;
						game.setDescription(JSON.stringify(p_info_speed),context.playerId);
						player_chat(context.playerId,`Your remaining balance is ${p_info_speed['L$']} L$.`,map_blank);
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
						player_chat(context.playerId,`You need more ${50-p_info_tele['L$']} L$ to purchase this buff.`,map_blank);
					}
					else {
						p_info_tele['L$'] -= 50;
						game.setDescription(JSON.stringify(p_info_tele),context.playerId);
						player_chat(context.playerId,`Your remaining balance is ${p_info_tele['L$']} L$.`,map_blank);
						game.teleport(map_blank,49,89,context.playerId);
					}
					
				}
				else if (obj[obj_key[i]]._tags.includes('event-teleporter')){
					if (is_event_start == false){
						game.teleport(map_dbg,50,50,context.playerId);
					}
					else {
						player_chat(context.playerId,'Event has been started.',map_blank);
					}
				}
				else {
					console.log('No _tags match.');
				}
			}
		}
	}
});

setInterval(()=>{
	if (Object.keys(game.partialMaps[map_blank]['collisions']['44']).includes('57') == false){
		/*add object door etc.*/
		game.engine.sendAction({
			$case: "mapAddObject",
			mapAddObject: { 
				mapId: map_blank,
				object: {
					_name: 'event-guard',
					_tags: [ 'guard-event', 'dbg-event' ],
					normal: GatherEventGuardNormal,
					highlighted: GatherEventGuardHighLight,
					type: 5,
					x: 57,
					y: 43,
					width: 1,
					height: 1,
					distThreshold : 1,
					id: "event-guard-01",
					previewMessage: "Not this time!!!",
				},
			}
		});
		game.engine.sendAction({
			$case: 'setImpassable',
			setImpassable: {
				mapId: map_blank,
				x: 57,
				y: 44,
				impassable: true,
			}
		});
	}
	else {
		/*remove set obj*/
		game.engine.sendAction({
			$case: "mapDeleteObjectById",
			mapDeleteObjectById: { 
				id: 'event-guard-01',
				mapId: map_blank,
			}
		});
		game.engine.sendAction({
			$case: 'setImpassable',
			setImpassable: {
				mapId: map_blank,
				x: 57,
				y: 44,
				impassable: false,
			}
		});
		setTimeout(()=>{
			game.engine.sendAction({
				$case: 'setImpassable',
				setImpassable: {
					mapId: map_blank,
					x: 57,
					y: 44,
					impassable: true,
				}
			});
			/*add object door etc.*/
			game.engine.sendAction({
				$case: "mapAddObject",
				mapAddObject: { 
					mapId: map_blank,
					object: {
						_name: 'event-guard',
						_tags: [ 'guard-event', 'dbg-event' ],
						normal: GatherEventGuardNormal,
						highlighted: GatherEventGuardHighLight,
						type: 5,
						x: 57,
						y: 43,
						width: 1,
						height: 1,
						distThreshold : 1,
						id: "event-guard-01",
						previewMessage: "Not this time!!!",
					},
				}
			});
		},7000);
	}
},180000);

/***************************************************************************/
game.subscribeToEvent("playerTriggersItem", (data, context) => {
	if(context.player.map == map_dbg){
		var t_pid = context.playerId;
		var all_pid_key = Object.keys(game.players);
		var all_pid = game.players;
		var t_pos_x = context.player.x;
		var t_pos_y = context.player.y;
		var t_pos = [
						{'x': t_pos_x-1, 'y': t_pos_y-1}, {'x': t_pos_x, 'y': t_pos_y-1}, {'x': t_pos_x+1, 'y': t_pos_y-1},
						{'x': t_pos_x-1, 'y': t_pos_y}, {'x': t_pos_x, 'y': t_pos_y}, {'x': t_pos_x+1, 'y': t_pos_y},
						{'x': t_pos_x-1, 'y': t_pos_y+1}, {'x': t_pos_x, 'y': t_pos_y+1}, {'x': t_pos_x+1, 'y': t_pos_y+1},
					];
		if (killer_id.includes(t_pid)){
			for (var i=0; i<all_pid_key.length; i++){
				for (var u=0; u<t_pos.length; u++){
					if (all_pid_key[i] != t_pid && all_pid[all_pid_key[i]].x == t_pos[u]['x'] && all_pid[all_pid_key[i]].y == t_pos[u]['y']){
						const pid = all_pid_key[i];
						game.engine.sendAction({
							$case: 'fxShakeCamera',
							fxShakeCamera:{
								intensity: 25,
								durationMs: 3000,
								mapId: map_dbg,
								targetUserId: pid
							}
						});
						var sur_info = JSON.parse(game.players[pid]['description']);
						sur_info['HP'] -= 40 
						if (sur_info['HP'] <= 0){
							sur_info['HP'] = 0;
							game.setDescription(JSON.stringify(sur_info),pid);
							game.teleport(map_dbg,51,79,pid);
							player_chat(pid,'You are dead!!',map_dbg);
							players_join.splice(pid,1);
							if (players_join.length == 0){
								killer_id = [];
								players_join = [];
								gens = [
									{'id': 'gen_a', 'gen_a': 0, 'is_trigger': false, 'is_break': false},
									{'id': 'gen_b', 'gen_b': 0, 'is_trigger': false, 'is_break': false},
									{'id': 'gen_c', 'gen_c': 0, 'is_trigger': false, 'is_break': false},
									{'id': 'gen_d', 'gen_d': 0, 'is_trigger': false, 'is_break': false},
									{'id': 'gen_e', 'gen_e': 0, 'is_trigger': false, 'is_break': false},
								];
								const all_pid_key_dead = Object.keys(game.players);
								for (var i=0;i<all_pid_key_dead.length;i++){
									if (game.players[all_pid_key_dead[i]]['map'] == map_dbg){
										game.teleport(map_blank,56,44,all_pid_key_dead[i]);
										game.setSpeedModifier(1,all_pid_key_dead[i]);
										//player_chat(all_pid_key_dead[i],'ROUND ENDED THE KILLER WON THE MATCH.',map_blank);
									}
								}
								player_chat('GLOBAL_CHAT','ROUND ENDED THE KILLER WON THE MATCH.',map_blank);
								is_event_start = false;
							}
						}
						else {
							game.setDescription(JSON.stringify(sur_info),pid);
							game.setSpeedModifier(3,pid);
							player_chat(pid,`Your remaining HP: ${sur_info['HP']}`,map_dbg);
							setTimeout(()=>{
								game.setSpeedModifier(1,pid);
							},3000);
						}
					}
				}
			}
		}
	}
});

game.subscribeToEvent('playerInteracts', (data, context) => {
	if (context.player.map == map_dbg && players_join.includes(context.playerId) == true){
		var sur_win_con = 0;
		for (var i=0; i<gens.length; i++){
			if (gens[i]['id'] == data.playerInteracts.objId && gens[i]['is_trigger'] == false){
				if (gens[i][gens[i]['id']] < 100){
					gens[i][gens[i]['id']] += 20;
					if(gens[i][gens[i]['id']] > 100){
						gens[i][gens[i]['id']] = 100;
					}
					player_chat(
									context.playerId,
									`Repairing progress: ${gens[i][gens[i]['id']]}%`,
									map_dbg
								);
					if (gens[i][gens[i]['id']] >= 100){
						player_chat(context.playerId,'This key has already repaired',map_dbg);
					}
				}
				else{
					player_chat(context.playerId,'This key has already repaired',map_dbg);
				}
				for (var w=0; w<gens.length; w++){
					sur_win_con += gens[w][gens[w]['id']];
				}
				if (sur_win_con >= sur_win_percent){
					killer_id = [];
					players_join = [];
					gens = [
						{'id': 'gen_a', 'gen_a': 0, 'is_trigger': false, 'is_break': false},
						{'id': 'gen_b', 'gen_b': 0, 'is_trigger': false, 'is_break': false},
						{'id': 'gen_c', 'gen_c': 0, 'is_trigger': false, 'is_break': false},
						{'id': 'gen_d', 'gen_d': 0, 'is_trigger': false, 'is_break': false},
						{'id': 'gen_e', 'gen_e': 0, 'is_trigger': false, 'is_break': false},
					];
					const all_pid_key_win = Object.keys(game.players);
					for (var j=0;j<all_pid_key_win.length;j++){
						if (game.players[all_pid_key_win[j]]['map'] == map_dbg){
							game.teleport(map_blank,56,44,all_pid_key_win[j]);
							game.setSpeedModifier(1,all_pid_key_win[j]);
							/* player_chat(
								all_pid_key_win[j],
								'ROUND ENDED THE SURVIVORS WON THE MATCH.',
								map_blank
							); */
						}
					}
					player_chat('GLOBAL_CHAT','ROUND ENDED THE SURVIVORS WON THE MATCH.',map_blank);
					is_event_start = false;
					break;
				}
				gens[i]['is_trigger'] = true;
				const inx = i;
				setTimeout(() => {
					gens[inx]['is_trigger'] = false;
				},60000);
				console.log(gens);
			}
		}
	}
	if (context.player.map == map_dbg && killer_id.includes(context.playerId) == true){
		for (var i=0; i<gens.length; i++){
			if (gens[i]['id'] == data.playerInteracts.objId && gens[i]['is_break'] == false && gens[i][gens[i]['id']] < 100){
				gens[i][gens[i]['id']] -= 25;
				if (gens[i][gens[i]['id']] < 0){
					gens[i][gens[i]['id']] = 0;
				}
				gens[i]['is_break'] = true;
				const inxx = i;
				setTimeout(() => {
					gens[inxx]['is_break'] = false;
				},47000);
				console.log(gens);
			}
		}
	}
});

game.subscribeToEvent("playerMoves", (data, context) => {
	if (context.player.map == map_dbg){
		user_id = context.playerId;
		x = data.playerMoves.x;
		y = data.playerMoves.y;
		var pos = [x,y];
		if (user_id.includes(killer_id)){
			for (var i = 0;i<check_point.length;i++){
				if (pos[0] == check_point[i]['x'] && pos[1] == check_point[i]['y']){
					game.teleport(map_dbg,fall_back[i]['x'],fall_back[i]['y'],user_id); // replace mapId if needed
					break;
				}
			}
		}
	}
});
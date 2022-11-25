game.subscribeToEvent("playerTriggersItem", (data, context) => {
	if(context.player.map == 'RdrF5O3qyQ91gFAdofHTv'){
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
								mapId: 'RdrF5O3qyQ91gFAdofHTv',
								targetUserId: pid
							}
						});
						var sur_info = JSON.parse(game.players[pid]['description']);
						sur_info['HP'] -= 40 
						if (sur_info['HP'] <= 0){
							sur_info['HP'] = 0;
							game.setDescription(JSON.stringify(sur_info),pid);
							game.teleport('RdrF5O3qyQ91gFAdofHTv',51,79,pid);
							game.engine.sendAction({
								$case: "chat",
									chat: { 
										chatRecipient: pid,
										contents: `You are dead!!`,
										localPlayerIds: [],
										mapId: 'RdrF5O3qyQ91gFAdofHTv',
									}
							});
							players_join.splice(pid,1);
							if (players_join.length == 0){
								killer_id = [];
								players_join = [];
								gens = [
									{'gen_a':0, 'id':'gen_a', 'is_trigger': false},
									{'gen_b':0, 'id':'gen_b', 'is_trigger': false},
									{'gen_c':0, 'id':'gen_c', 'is_trigger': false},
									{'gen_d':0, 'id':'gen_d', 'is_trigger': false},
									{'gen_e':0, 'id':'gen_e', 'is_trigger': false},
								];
								const all_pid_key_dead = Object.keys(game.players);
								for (var i=0;i<all_pid_key_dead.length;i++){
									if (game.players[all_pid_key_dead[i]]['map'] == 'RdrF5O3qyQ91gFAdofHTv'){
										game.teleport('blank',56,44,all_pid_key_dead[i]);
										game.setSpeedModifier(1,all_pid_key_dead[i]);
										game.engine.sendAction({
											$case: "chat",
												chat: { 
													chatRecipient: all_pid_key_dead[i],
													contents: `ROUND ENDED THE KILLER WON THE MATCH.`,
													localPlayerIds: [],
													mapId: 'blank',
												}
										});
									}
								}
								is_event_start = false;
							}
						}
						else {
							game.setDescription(JSON.stringify(sur_info),pid);
							game.setSpeedModifier(3,pid);
							game.engine.sendAction({
								$case: "chat",
									chat: { 
										chatRecipient: pid,
										contents: `Your remaining HP: ${sur_info['HP']}`,
										localPlayerIds: [],
										mapId: 'RdrF5O3qyQ91gFAdofHTv',
									}
							});
							setTimeout(()=>{
								game.setSpeedModifier(1,pid);
							},60000);
						}
					}
				}
			}
		}
	}
});

game.subscribeToEvent('playerInteracts', (data, context) => {
	if (context.player.map == 'RdrF5O3qyQ91gFAdofHTv' && players_join.includes(context.playerId) == true){
		var sur_win_con = 0;
		for (var i=0; i<gens.length; i++){
			if (gens[i]['id'] == data.playerInteracts.objId && gens[i]['is_trigger'] == false){
				if (gens[i][gens[i]['id']] < 5){
					gens[i][gens[i]['id']] += 1;
					game.engine.sendAction({
						$case: "chat",
							chat: { 
								chatRecipient: context.playerId,
								contents: `Repairing progress: ${gens[i][gens[i]['id']]*20}%`,
								localPlayerIds: [],
								mapId: 'RdrF5O3qyQ91gFAdofHTv',
							}
					});
					if (gens[i][gens[i]['id']] == 5){
						game.engine.sendAction({
							$case: "chat",
								chat: { 
									chatRecipient: context.playerId,
									contents: `This key has already repaired`,
									localPlayerIds: [],
									mapId: 'RdrF5O3qyQ91gFAdofHTv',
								}
						});
					}
				}
				else{
					game.engine.sendAction({
						$case: "chat",
							chat: { 
								chatRecipient: context.playerId,
								contents: `This key has already repaired`,
								localPlayerIds: [],
								mapId: 'RdrF5O3qyQ91gFAdofHTv',
							}
					});
				}
				for (var w=0; w<gens.length; w++){
					sur_win_con += gens[w][gens[w]['id']];
				}
				if (sur_win_con == 25){
					killer_id = [];
					players_join = [];
					gens = [
						{'gen_a':0, 'id':'gen_a', 'is_trigger': false},
						{'gen_b':0, 'id':'gen_b', 'is_trigger': false},
						{'gen_c':0, 'id':'gen_c', 'is_trigger': false},
						{'gen_d':0, 'id':'gen_d', 'is_trigger': false},
						{'gen_e':0, 'id':'gen_e', 'is_trigger': false},
					];
					const all_pid_key_win = Object.keys(game.players);
					for (var j=0;j<all_pid_key_win.length;j++){
						if (game.players[all_pid_key_win[j]]['map'] == 'RdrF5O3qyQ91gFAdofHTv'){
							game.teleport('blank',56,44,all_pid_key_win[j]);
							game.setSpeedModifier(1,all_pid_key_win[j]);
							game.engine.sendAction({
								$case: "chat",
									chat: { 
										chatRecipient: all_pid_key_win[j],
										contents: `ROUND ENDED THE SURVIVORS WON THE MATCH.`,
										localPlayerIds: [],
										mapId: 'blank',
									}
							});
						}
					}
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
});

game.subscribeToEvent("playerMoves", (data, context) => {
	if (context.player.map == 'RdrF5O3qyQ91gFAdofHTv'){
		user_id = context.playerId;
		x = data.playerMoves.x;
		y = data.playerMoves.y;
		var pos = [x,y];
		if (user_id.includes(killer_id)){
			for (var i = 0;i<check_point.length;i++){
				if (pos[0] == check_point[i]['x'] && pos[1] == check_point[i]['y']){
					//console.log('FOUND KILLER POS');
					game.teleport('RdrF5O3qyQ91gFAdofHTv',fall_back[i]['x'],fall_back[i]['y'],user_id); // replace mapId if needed
					break;
				}
			}
		}
	}
});
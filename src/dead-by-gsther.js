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
					if(all_pid_key[i] != t_pid && all_pid[all_pid_key[i]].x == t_pos[u]['x'] && all_pid[all_pid_key[i]].y == t_pos[u]['y']){
						const pid = all_pid_key[i];
						game.engine.sendAction({
							$case: 'fxShakeCamera',
							fxShakeCamera:{
								intensity: 50,
								durationMs: 3000,
								mapId: 'RdrF5O3qyQ91gFAdofHTv',
								targetUserId: pid
							}
						});
						var sur_info = JSON.parse(game.players[pid]['description']);
						sur_info['HP'] -= 40 
						if (sur_info['HP'] <= 0){
							sur_info['HP'] = 0 
							game.setDescription(JSON.stringify(sur_info),pid);
							game.teleport('RdrF5O3qyQ91gFAdofHTv',51,79,pid)
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
									{'gen_a':0, 'id':'gen_a'},
									{'gen_b':0, 'id':'gen_b'},
									{'gen_c':0, 'id':'gen_c'},
									{'gen_d':0, 'id':'gen_d'},
									{'gen_e':0, 'id':'gen_e'},
								];
								const all_pid_key_dead = Object.keys(game.players);
								for (var i=0;i<all_pid_key_dead.length;i++){
									if(game.players[all_pid_key_dead[i]]['map'] == 'RdrF5O3qyQ91gFAdofHTv'){
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
						else{
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
							},3000);
						}
					}
				}
			}
		}
	}
});

game.subscribeToEvent("playerMoves", (data, context) => {
	if(context.player.map == 'RdrF5O3qyQ91gFAdofHTv'){
		user_id = context.playerId;
		x = data.playerMoves.x;
		y = data.playerMoves.y;
		var pos = [x,y];
		if(user_id.includes(killer_id)){
			for(var i = 0;i<check_point.length;i++){
				if(pos[0] == check_point[i]['x'] && pos[1] == check_point[i]['y']){
					//console.log('FOUND KILLER POS');
					game.teleport('RdrF5O3qyQ91gFAdofHTv',fall_back[i]['x'],fall_back[i]['y'],user_id); // replace mapId if needed
					break;
				}
			}
		}
	}
});
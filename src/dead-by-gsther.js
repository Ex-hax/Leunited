game.subscribeToEvent("playerTriggersItem", (data, context) => {
	if(context.player.map == 'RdrF5O3qyQ91gFAdofHTv'){
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
							game.teleport('RdrF5O3qyQ91gFAdofHTv',51,79,pid)
							game.engine.sendAction({
								$case: 'fxShakeCamera',
								fxShakeCamera:{
									intensity: 50,
									durationMs: 3000,
									mapId: 'RdrF5O3qyQ91gFAdofHTv',
									targetUserId: pid
								}
							});
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
//webhook
const webhook_api = 'https://4119-2001-fb1-eb-198a-f9c9-8819-ecae-efa3.jp.ngrok.io' //Pls update when start new ngrok here and line
//GatherTown
const space_id = 'VJ01mwNnpyXsL76g\\Leunited';
const map_blank = 'AUNxBku-FXug6Z6tsk9Nv';
const map_dbg = 'RdrF5O3qyQ91gFAdofHTv';
const gatherTown_token = 'CqJ8NIBnx3VZlDIQ';
const gatherTown_botId = 'pdZnTdb7VShWtOz6F2xdVAJ4nOs2';
// for test GET map data
const test_api_blank = 'https://gather.town/api/getMap?spaceId=VJ01mwNnpyXsL76g\\Leunited&mapId=AUNxBku-FXug6Z6tsk9Nv&apiKey=CqJ8NIBnx3VZlDIQ';
//raw
const gatherTownBackgroundImagePathNormalTheme = 'https://raw.githubusercontent.com/Ex-hax/Leunited/master/map/main.png';
const gatherTownBackgroundImagePathDarkTheme = 'https://raw.githubusercontent.com/Ex-hax/Leunited/master/map/main-dark.png';
const gatherEventGuardNormal = 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/uploads/VJ01mwNnpyXsL76g/sk9cAZWl1dVqX8LK7pY4JR';
const gatherEventGuardHighLight = 'https://cdn.gather.town/storage.googleapis.com/gather-town.appspot.com/uploads/VJ01mwNnpyXsL76g/g3YiJ6jtarC9BIRyFOzsb4';

module.exports = {
	space_id, map_blank, map_dbg, gatherTown_token, gatherTown_botId, test_api_blank,
	webhook_api,
	gatherTownBackgroundImagePathNormalTheme, gatherTownBackgroundImagePathDarkTheme,
	gatherEventGuardNormal, gatherEventGuardHighLight
};
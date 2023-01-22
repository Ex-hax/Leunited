import errno
import os
import sys
import json

from flask import Flask, request, abort, current_app
from flask_socketio import SocketIO

from linebot import (
    LineBotApi, WebhookHandler
)
from linebot.exceptions import (
    InvalidSignatureError
)
from linebot.models import (
    MessageEvent, TextMessage, TextSendMessage,
    SourceUser, SourceGroup, SourceRoom,
    TemplateSendMessage, ConfirmTemplate, MessageTemplateAction,
    ButtonsTemplate, URITemplateAction, PostbackTemplateAction,
    CarouselTemplate, CarouselColumn, PostbackEvent,
    StickerMessage, StickerSendMessage, LocationMessage, LocationSendMessage,
    ImageMessage, VideoMessage, AudioMessage,
    UnfollowEvent, FollowEvent, JoinEvent, LeaveEvent, BeaconEvent
)

app = Flask(__name__)
app.app_context().push()
app.config['SECRET_KEY'] = 'fdr$htdh@Thdgth&gdfhd'
app.config['UPLOAD_FOLDER'] = 'static'
map_id_file_path = os.path.join(current_app.root_path,'static','l2g_mapID.JSON')
socketio = SocketIO(app)

if os.path.exists(map_id_file_path):
    pass
else:
    with open(map_id_file_path,'w+') as fs:
        fs.write(
            json.dumps(
                {
                    'NEXT_ID': '1',
                    'L2G': [],
                }
            )
        );

def get_list():
    with open(map_id_file_path,'r') as fs:
        return json.load(fs)

def update_list(update_data):
    with open(map_id_file_path,'w') as fs:
        fs.write(json.dumps(update_data))
        
# get channel_secret and channel_access_token from your environment variable
channel_secret = 'e597f0ff12fee95ef80534e29e481569'
channel_access_token = 'zEAZQ0zutH0t4UBTurBK7G17kDR6Cw4T8wEJZn31lXmi+jHC1qTUMc6bFyg4dUkpW3FE12GbYy2bdLcWV/MmqqmeOkbzvMpd/FfF/unSo6BOcXZpYI1uWw9PjlnGbffB+A6tL82pYm+2Rk3O/XbSfwdB04t89/1O/w1cDnyilFU='
if channel_secret is None:
    print('Specify LINE_CHANNEL_SECRET as environment variable.')
    sys.exit(1)
if channel_access_token is None:
    print('Specify LINE_CHANNEL_ACCESS_TOKEN as environment variable.')
    sys.exit(1)

line_bot_api = LineBotApi(channel_access_token)
handler = WebhookHandler(channel_secret)

@app.route("/callback", methods=['POST'])
def callback():
    # get X-Line-Signature header value
    signature = request.headers['X-Line-Signature']

    # get request body as text
    body = request.get_data(as_text=True)
    app.logger.info("Request body: " + body)

    # handle webhook body
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        abort(400)

    return 'OK'


@handler.add(MessageEvent, message=TextMessage)
def handle_text_message(event):
    text_case = event.message.text.split(' ')
    if len(text_case[0]) < 2:
        text_case[0] += '#'
    text = event.message.text

    if text_case[0] == '/profile':
        if isinstance(event.source, SourceUser):
            profile = line_bot_api.get_profile(event.source.user_id)
            line_bot_api.reply_message(
                event.reply_token, [
                    TextSendMessage(
                        text=f'''User ID: {event.source.user_id}\nLine display name: {profile.display_name}\nStatus message: {profile.status_message}'''
                    )
                ]
            )
        else:
            line_bot_api.reply_message(
                event.reply_token,
                TextMessage(text="Bot can't use profile API without user ID"))
    elif text_case[0] == '/getlist':
        current_data_list = get_list()
        if len(current_data_list['L2G']) == 0:
            if isinstance(event.source, SourceUser):
                line_bot_api.reply_message(
                        event.reply_token, [
                            TextSendMessage(
                                text='Player\'s data not available for now.'
                            )
                        ]
                )
        else:
            send_data = 'ID, Name,\t\tGatherTownID\n'
            for i in range(len(current_data_list['L2G'])):
                send_data += f"{i+1}, {current_data_list['L2G'][i][str(i+1)]['standard_name']}\n"
            line_bot_api.reply_message(
                    event.reply_token, [
                        TextSendMessage(
                            text=send_data
                        )
                    ]
            )
        
    elif text_case[0] == '/regis': #may be not use this condition
        text = text.replace('/regis ','')
        if text != '/regis':
            current_data = get_list()
            current_data_gather_id = []
            for i in range(len(current_data['L2G'])):
                current_data_gather_id.append(current_data['L2G'][i][str(i+1)]['gather_id'])
            if text not in current_data_gather_id:
                line_bot_api.reply_message(
                    event.reply_token,[
                        TextSendMessage(
                            text='GatherTown player\'s ID not found!!'
                        )
                    ]
                )
            else:
                inx = current_data_gather_id.index(text)
                current_data['L2G'][inx][str(inx+1)]['line_id'] = event.source.user_id
                update_list(current_data)
                line_bot_api.reply_message(
                    event.reply_token,[
                        TextSendMessage(
                            text='Register successful!!'
                        )
                    ]
                )
        else:
            line_bot_api.reply_message(
                event.reply_token,[
                    TextSendMessage(
                        text='Please fill GatherTown player\'s ID!!!'
                    )
                ]
            )
    elif text_case[0][0] == '/' and text_case[0][1] == '@':
        id = text_case[0].replace('/@','')
        check_player_data = get_list()
        if id in [str(g+1) for g in range(len(check_player_data['L2G']))]:# receipt id available?
            if check_player_data['L2G'][int(id)-1][id]['line_id'] != '':# receipt has regis?
                update_list(check_player_data)
                message_text = text.replace('/@'+str(id),'')
                socketio.send(
                    json.dumps(
                        {
                            'case':'/message',
                            'receipt_gather_id':check_player_data['L2G'][int(id)-1][id]['gather_id'],
                            'sender_line_display_name': line_bot_api.get_profile(event.source.user_id).display_name,
                            'message_text': message_text
                        }
                    )
                )
            else:
                line_bot_api.reply_message(
                    event.reply_token,[
                        TextSendMessage(
                            text='You can\'t send message to non-registor LineOA player!!!'
                        )
                    ]
                )
                
        else:
            line_bot_api.reply_message(
                event.reply_token,[
                    TextSendMessage(
                        text='Incorrect player\'s ID!!!'
                    )
                ]
            )
    else:
        line_bot_api.reply_message(
            event.reply_token, TextSendMessage(
                    text='Command not found!\n Available command\n1. /getlist\n2. /regis <gather_id>\n3. /@<id> <message>'
                )
        )
            
@app.route('/api/<playerID>/<playerName>')
def cre_upd_users(playerID,playerName):
    if request.method == 'GET':
        current_data = get_list()
        if len(current_data['L2G']) == 0:
            print(current_data['L2G'])
            current_data['L2G'].append(
                {
                    current_data['NEXT_ID']: {
                        'gather_id': playerID,
                        'line_id':'',
                        'standard_name': playerName,
                    }
                }   
            )
            current_data['NEXT_ID'] = int(current_data['NEXT_ID']) + 1
            update_list(current_data)
        else:
            current_data = get_list()
            current_data_gather_id  = []
            for i in range(len(current_data['L2G'])):
                current_data_gather_id.append(current_data['L2G'][i][str(i+1)]['gather_id'])
            if playerID not in current_data_gather_id:
                current_data['L2G'].append(
                    {
                        current_data['NEXT_ID']: {
                            'gather_id': playerID,
                            'line_id':'',
                            'standard_name': playerName,
                        }
                    }
                )
                current_data['NEXT_ID'] = int(current_data['NEXT_ID']) + 1
                update_list(current_data)

        return json.dumps(current_data)

@app.route('/api/getlist')
def getList():
    if request.method == 'GET':
        return get_list()

@app.route('/api/sendchat',methods=['POST'])
def sendchat():
    data = request.get_json()
    send_to_LineOA = get_list()
    line_user_id = send_to_LineOA['L2G'][int(data['receipt_line_id'])-1][data['receipt_line_id']]['line_id']
    line_bot_api.multicast(
        [
            line_user_id
        ],
        TextSendMessage(
            text=f'{data["sender_gather_name"]} => {data["message_text"]}'
        )
    )
            
    return {}
    
if __name__ == "__main__":
    app.run(debug=True)
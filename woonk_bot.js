/*
    woonk_bot
    Helps users with theirs doubts.
    Controll the behaviour of the members in the group.
*/
require('dotenv').config();
const TeleBot = require('telebot');
const bot = new TeleBot(process.env.TOKEN_TELEGRAM_API);
const urlRegex = require('url-regex');
const fs = require('fs');

// On command "play"
bot.on('/play', function (msg) {

    let text = '📡 Woonkly es la primera plataforma que paga 💰 a las personas por ver y compartir contenido digital (vídeo, imagen y texto) de diferentes plataformas.';

    return bot.sendMessage(msg.chat.id, text);
});

// On command "rules"
bot.on('/rules', function (msg) {

    let text = "• Don't talk about Fight Club \n• Spam advertisements / adult content = immediate ban. \n• Please keep discussions polite and constructive.";

    return bot.sendMessage(msg.chat.id, text);
});

// On command "woonkCost"
bot.on('/woonkCost', function (msg) {

    let text = 'Precio actual del woonk: \n 1 ETH = 50,000 WNKs + el bonus actual ';

    return bot.sendMessage(msg.chat.id, text);
});

// On command "stepsToBuy"
bot.on('/stepsToBuy', function (msg) {
    let text = '¡Comprar woonks es muy sencidata.new_chat_member.username +llo! \nTienes que seguir éstos 9 sencillos pasos: \n1.- Accede a sitio web oficial de Woonkly: https://woonkly.com/privateico/ \n2.- Da click en el botón "Comprar". \n3.- Inicia sesión en tu cuenta de Woonkly. \n4.- Ingresa la cantidad de ETHs que quisieras comprar. \n5.- Da click al botón "COMPRAR". \n6.- Selecciona la wallet que quieras usar. \n7.- Autoriza la transacción. \n8.- Ya que haces esto, ingresa en el botón "+" el Address de la wallet donde se guardarán tus Woonks. \n9.- ¡Listo! Ya compraste Woonks.'

    return bot.sendMessage(msg.chat.id, text);

});

// detect if someone just joined
bot.on('newChatMembers', function (data) {
    if (data.new_chat_member != undefined) {
        bot.sendMessage(data.chat.id, `¡Bienvenido a Woonkly @${data.new_chat_member.username}! `);
    }
});

// Log every text message
bot.on('text', function (data) {
    // 0 -> groserias
    // 1 -> /woonkCost
    // 2 -> /stepsToBuy

    if(data.entities != undefined) {
        if(regexWoonkly(data.text)) {
            warnUser(data, 'spam');
        }
    }
    let index = null;
    for (var i = 0; i < 3; i++) {
        if(checkContent(data, i)) {
            index = i;
            break;
        }
    }
    switch (index) {
        case 0:
            warnUser(data, 'groserías');
            break;
        case 1:
            sendFAQ(data, 1);
            break;
        case 2:
            sendFAQ(data, 2);
            break;
        default:
            break;
    }
});

// Start getting updates
bot.start();

// checks for content forbidden
function checkContent(data, typeofContent) {
    let text = data.text.toLowerCase()
    text = text.split(' ');
    var dataJson = fs.readFileSync('data.json');
    var list = JSON.parse(dataJson);
    var array = Object.keys(list).map(function(k) { return list[k] });
    try {
        for (var i = 0, len = text.length; i < len; i++) {
            if(array[typeofContent].indexOf(text[i]) != -1) {
                return true;
            }
        }
    }
    catch(err) {
        console.log('checkContent(): ', err.message);
    }
}

function regexWoonkly(text) {
    let pattWoonkly = new RegExp('.*(woonkly).*');
    let pattYoutube = new RegExp('.*(youtube).*');
    let array = ['https://t.me/joinchat/HIxsXhC6DXsM2c2zXS3wKw', 'https://t.me/joinchat/Hu8281CBxcNDycg10WZKLw'];
    let matches = text.match(urlRegex());
    try {
        for (var i = 0, len = matches.length; i < len; i++) {
            if(!pattWoonkly.test(matches[i]) && !pattYoutube.test(matches[i])) {
                if(array.indexOf(matches[i]) == -1) {
                    return true;
                }
            }
        };
    }
    catch(err) {
        console.log('regexWoonkly(): ', err.message);
    }
}

function replyAndDelete(data, fault, times) {
    console.log('username: ', data.from.username, '| fault: ',  fault, '| times: ', times);
    try {
        bot.sendMessage(chat_id=data.chat.id, '¡Publicar '+fault+' está prohibido, @'+data.from.username+'! Por favor, evítanos la pena de bannearte. \n'+times+'/2 advertencias.', { reply: data.message_id });
        return bot.deleteMessage(data.chat.id, data.message_id);
    }
    catch(err) {
        console.log('on.Text: ', err.message);
    }
}

function warnUser(data, fault) {
    var dataJson = () => {
        try {
            var userString = fs.readFileSync('warnedUsers.json');
            return warned = JSON.parse(userString);
        } catch (e) {
            return [];
        }
    };

    try {
        var warnedUsers = dataJson();
        var existUser = warnedUsers.find((warnedUsers) => warnedUsers.id == data.from.id);
        if (existUser != undefined) {
            if(existUser.times == 2) {
                try {
                    bot.deleteMessage(data.chat.id, data.message_id);
                    bot.kickChatMember(data.chat.id, data.from.id);
                } catch (e) {
                    console.log('kickChatMember(): ', e);
                }
            } else {
                warnedUsers.find((warnedUsers) => warnedUsers.id == data.from.id).times++;
                let times = warnedUsers.find((warnedUsers) => warnedUsers.id == data.from.id).times;
                fs.writeFileSync('warnedUsers.json', JSON.stringify(warnedUsers));
                replyAndDelete(data, fault, times);
            }
        } else {
            var user = {
                id: data.from.id,
                times: 1
            }
            warnedUsers.push(user);
            fs.writeFileSync('warnedUsers.json', JSON.stringify(warnedUsers));
            replyAndDelete(data, fault, user.times);
        }
    } catch (e) {
        console.log('error: ', e);
    }
}

function sendFAQ(data, typeofFAQ) {
    let text = '';
    if(typeofFAQ === 1) {
        text = 'Precio actual del woonk: \n 1 ETH = 50,000 WNKs + el bonus actual ';
    } else {
        text = '¡Comprar woonks es muy sencillo! \nTienes que seguir éstos 9 sencillos pasos: \n1.- Accede a sitio web oficial de Woonkly: https://woonkly.com/privateico/ \n2.- Da click en el botón "Comprar". \n3.- Inicia sesión en tu cuenta de Woonkly. \n4.- Ingresa la cantidad de ETHs que quisieras comprar. \n5.- Da click al botón "COMPRAR". \n6.- Selecciona la wallet que quieras usar. \n7.- Autoriza la transacción. \n8.- Ya que haces esto, ingresa en el botón "+" el Address de la wallet donde se guardarán tus Woonks. \n9.- ¡Listo! Ya compraste Woonks.'
    }
    return bot.sendMessage(data.chat.id, text);
}

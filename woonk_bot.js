/*
    woonk_bot
    Helps users with theirs doubts.
    Controll the behaviour of the members in the group.
*/
require('dotenv').config()
const TeleBot = require('telebot')
const bot = new TeleBot(process.env.TOKEN_TELEGRAM_API)
const urlRegex = require('url-regex')
const fs = require('fs')

// On command "play"
bot.on('/info', function (msg) {

    let text = '📡 Woonkly es la primera plataforma que paga 💰 a las personas por ver y compartir contenido digital (vídeo, imagen y texto) de diferentes plataformas.'

    return bot.sendMessage(msg.chat.id, text)
})

// On command "rules"
bot.on('/rules', function (msg) {

    let text = '• No spam \n• No groserías \n• No hablar sobre otras ICO \n• No hablar de señales de compra o venta \n• No contenido para adultos \n• Siempre tratarse con respeto \n• Usar el sentido común \nEl desconocimiento de estas reglas no te exenta de su cumplimiento'

    return bot.sendMessage(msg.chat.id, text)
})

// On command "help"
bot.on('/help', function (msg) {

    let text = "\n¡Hola mi nombre es Woonkzalo y estoy aquí para ayudarte! \n\n Mis comandos disponibles son: \n\n/info - que es Woonkly \n/rules - reglas del grupo \n/price - ver precio actual del woonk \n/stepsToBuy - pasos para adquirir woonks \n/help - lista de comandos"

    return bot.sendMessage(msg.chat.id, text)
})

// On command "woonkCost"
bot.on('/price', function (msg) {

    let text = 'Precio actual del woonk: \n 1 ETH = 50,000 WNKs + el bonus actual '

    return bot.sendMessage(msg.chat.id, text)
})

// On command "stepsToBuy"
bot.on('/stepsToBuy', function (msg) {
    let text = '¡Comprar woonks es muy sencillo! \n\nTienes que seguir éstos 10 sencillos pasos: \n\n1.-  Accede a sitio web oficial de Woonkly: https://woonkly.com \n2.- Da click en el botón "Comprar". ( Si ya estás registrado, de lo contrario llena el formulario de venta privada ). \n3.- Inicia sesión en tu cuenta de Woonkly. \n4.- Selecciona la moneda con la que quieras comprar. \n5.- Ingresa la cantidad de Woonks que quisieras comprar. \n6.- Da click al botón "COMPRAR". \n7.- En caso de que sea Ethereum, no envíes desde casas de cambio y pon el gas limit de 120,000; y Gas Price a 20 GWEI. \n8.- Envía la cantidad exacta que pusiste (en caso de ser ETH debes enviar desde el wallet que quieres recibir los Woonks) y autoriza la transacción. \n9.- Ya que haces esto, ingresa en el botón "+" el Address de la wallet donde guardaras tus Woonks. \n10.- ¡Listo! Ya compraste Woonks.'

    return bot.sendMessage(msg.chat.id, text)

})

// detect if someone just joined
bot.on('newChatMembers', function (data) {
    if (data.new_chat_member != undefined) {
        if(data.new_chat_member.username != undefined) {
            bot.sendMessage(data.chat.id, `¡Bienvenido a Woonkly @${data.new_chat_member.username}! no olvides seguir las /rules `)
        } else {
            bot.sendMessage(data.chat.id, `¡Bienvenido a Woonkly ${data.new_chat_member.first_name}! no olvides seguir las /rules `)
        }
    }
})

// Log every text message
bot.on('text', function (data) {
    // es 0 -> groserias
    // es 1 -> /price
    // es 2 -> /stepsToBuy
    // en 3 -> insults

    if(data.chat.id == process.env.ES_CHAT_ID) {
        if(data.entities != undefined) {
            if(regexWoonkly(data.text)) {
                warnUser(data, 'spam')
            }
        }
        let index = null
        for (var i = 0; i < 3; i++) {
            if(checkContent(data, i)) {
                index = i
                break
            }
        }
        switch (index) {
            case 0:
                warnUser(data, 'groserías')
                break
            case 1:
                sendFAQ(data, 1)
                break
            case 2:
                sendFAQ(data, 2)
                break
            default:
                break
        }
    }
})

// Start getting updates
bot.start()

// checks for content forbidden
function checkContent(data, typeofContent) {
    let text = data.text.toLowerCase()
    text = text.split(' ')
    var dataJson = fs.readFileSync('data.json')
    var list = JSON.parse(dataJson)
    var array = Object.keys(list.data_es).map(function(k) { return list.data_es[k] })
    try {
        for (var i = 0, len = text.length; i < len; i++) {
            if(array[typeofContent].indexOf(text[i]) != -1) {
                return true
            }
        }
    }
    catch(err) {
        console.log('checkContent(): ', err.message)
    }
}

function regexWoonkly(text) {
    let pattWoonkly = new RegExp('.*(woonkly).*')
    let pattYoutube = new RegExp('.*(youtube).*')
    let array = ['https://t.me/joinchat/hixsxhc6dxsm2c2zxs3wkw', 'https://t.me/joinchat/hu8281cbxcndycg10wzklw']
    text = text.toLowerCase()
    let matches = text.match(urlRegex({exact: true, strict: false}))
    if(matches != null) {
        try {
            for (var i = 0, len = matches.length; i < len; i++) {
                if(!pattWoonkly.test(matches[i]) && !pattYoutube.test(matches[i])) {
                    if(array.indexOf(matches[i]) == -1) {
                        return true
                    }
                }
            }
        }
        catch(err) {
            console.log('regexWoonkly(): ', err.message)
        }
    }
}

async function replyAndDelete(data, fault, times) {
    console.log('username: ', data.from.username, '| fault: ',  fault, '| times: ', times)
    if(data.from.username != undefined) {
        await bot.sendMessage(data.chat.id, `¡Publicar ${fault} está prohibido, @${data.from.username}! Por favor, evítanos la pena de bannearte. \n${times}/2 advertencias.`, { reply: data.message_id }).then(d =>{
            return
        })
    } else {
        await bot.sendMessage(data.chat.id, `¡Publicar ${fault} está prohibido, ${data.from.first_name}! Por favor, evítanos la pena de bannearte. \n${times}/2 advertencias.`, { reply: data.message_id }).then(d =>{
            return
        })
    }

    await bot.deleteMessage(data.chat.id, data.message_id).then(data =>{
        return
    })
    return
}

function warnUser(data, fault) {
    var dataJson = () => {
        try {
            var userString = fs.readFileSync('warnedUsers.json')
            return warned = JSON.parse(userString)
        } catch (e) {
            return []
        }
    }

    try {
        var warnedUsers = dataJson()
        var existUser = warnedUsers.find((warnedUsers) => warnedUsers.id == data.from.id)
        if (existUser != undefined) {
            if(existUser.times == 2) {
                try {
                    bot.deleteMessage(data.chat.id, data.message_id)
                    bot.kickChatMember(data.chat.id, data.from.id)
                } catch (e) {
                    console.log('kickChatMember(): ', e)
                }
            } else {
                warnedUsers.find((warnedUsers) => warnedUsers.id == data.from.id).times++
                let times = warnedUsers.find((warnedUsers) => warnedUsers.id == data.from.id).times
                fs.writeFileSync('warnedUsers.json', JSON.stringify(warnedUsers))
                replyAndDelete(data, fault, times)
            }
        } else {
            var user = {
                id: data.from.id,
                times: 1
            }
            warnedUsers.push(user)
            fs.writeFileSync('warnedUsers.json', JSON.stringify(warnedUsers))
            replyAndDelete(data, fault, user.times)
        }
    } catch (e) {
        console.log('error: ', e)
    }
}

function sendFAQ(data, typeofFAQ) {
    let text = ''
    if(typeofFAQ === 1) {
        text = 'Precio actual del woonk: \n 1 ETH = 50,000 WNKs + el bonus actual '
    } else {
        text = '¡Comprar woonks es muy sencillo! \nTienes que seguir éstos 9 sencillos pasos: \n1.- Accede a sitio web oficial de Woonkly: https://woonkly.com/privateico/ \n2.- Da click en el botón "Comprar". \n3.- Inicia sesión en tu cuenta de Woonkly. \n4.- Ingresa la cantidad de ETHs que quisieras comprar. \n5.- Da click al botón "COMPRAR". \n6.- Selecciona la wallet que quieras usar. \n7.- Autoriza la transacción. \n8.- Ya que haces esto, ingresa en el botón "+" el Address de la wallet donde se guardarán tus Woonks. \n9.- ¡Listo! Ya compraste Woonks.'
    }
    return bot.sendMessage(data.chat.id, text)
}

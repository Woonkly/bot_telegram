# _Woonkzalo_ Telegram Bot
[![Woonkly](https://woonkly.com/img/powered_woonkly.png)](https://woonkly.com)

_Woonkzalo_ is a Telegram bot that answers the supergroup´s users their questions and also helps to mantain the order by removing conflicting members.

If a developer wants to use Woonkzalo as their Telegram bot, he can configure the answers options, the supergroup´s rules and the user warning notifications.

## Technologies you will need.
* [Node.js](https://nodejs.org/en/) - Cross-platform, open source runtime environment for the server layer.
* [Telebot](https://github.com/mullwar/telebot) - Node.js module designed to create Telegram bots.
* [Url Regex](https://www.npmjs.com/package/url-regex) - Node.js module designed to obtain a url in a string.
* [i18n](https://github.com/mashpie/i18n-node) - Lightweight simple translation module for node.js / express.js with dynamic json storage.
* [dotenv](https://www.npmjs.com/package/dotenv) - (Optional) We use this module to import our enviroment variable.
## Starting the bot.
_Woonkzalo Bot_ requires [Node.js](https://nodejs.org/) v8+ to run.

Download the project, install all the dependencies and devDependencies and start the bot.

```bash
$npm install
$node woonk_bot
```
## Adding the bot to Telegram.
In order to add a bot to Telegram, you need to follow the instructions that the [Telegram´s API](https://core.telegram.org/bots) provides, you need to create a new bot with the Botfather tool Telegram has.

After you complete the Botfather´s basic configuration, it will give you a token, it´s very important to keep secure this token.

To use the token, you need to write it in the _woonk_bot.js file_, in the first lines were you create a Telebot instance.

* Token usage:
```JavaScript

const TeleBot = require('telebot')
const bot = new TeleBot( TOKEN_PROVIDED_BY_BOTFATHER )

```
After you´ve done that, the bot is ready to be added to the group you want.

## Bot Commands.
There are a lot of commands you can use, depending the information you want to obtain, **remember that Woonkzalo was designed mainly to help in the user´s FAQ of an ICO, so keep in mind that the commands are thought for an ICO.**

Woonkzalo Bot recognizes this commands:

* **/info :** Gives a brief description about [Woonkly](https://woonkly.com).
* **/rules :** Shows the group´s rules.
* **/price :** Shows the current WNK's price (in ETHs).
* **/howToBuy :** Describes in 10 steps the process of buying Woonks.
* **/help :** Lists all the commands.

If you want to modify or create a new bot command, you can go to the **_woonk_bot.js_ file** and add or modify the command you want. If you want a new command, lets say "/myNewCommand", you need to modify the **en_US.json file in the _locals_ directory**, by inserting a new key named "myNewCommand" and define the message that command will return.

Creating "/myNewCommand"...

* First you need to modify the json file.
```json
{
  //UPDATE
  "myNewCommand" : "This is my new command!",

  "info" :"Info message",
  "rules" : "Rules message",
}
```
* Then, write the code for the new command in the js file.
```JavaScript
bot.on('/myNewCommand', function (data) {

    return bot.sendMessage(data.chat.id,  __('myNewCommand')) //'myNewCommand' represents the key in the JSON file
})
```
**NOTE:** The __( ) Function is a function used with the module i18n Node, used for translation. You can see the documentation in this [link](https://github.com/mashpie/i18n-node).


## Warning Notifications.
_Woonkzalo Bot_ uses the following warning system: if a user posts insulting words or spam content, Woonkzalo deletes the message and warns them by sending a message with their username or their firstname with the type of fault commited and the number of warnings that user has.

A user can have **at most 2 warnings**, if a user gets a third one, he will be banned from the supergroup.

You can see all the warned users in the _warnedUsers.json_ file. Here you can find all the supergroup´s user that have been warned by the bot.

**NOTE:** _Woonkzalo_ can´t ban supergroup´s administrators, if an administrator reaches the warnings limit, the next messages are just going to be deleted.

* warnedUsers.json example:

```json
[

//{id: User´s ID, times: number of warnings},

  {"id" : "12345678", "times" : 1  },
  {"id" : "23456781", "times" : 2  },
  {"id" : "34567812", "times" : 1  }
]
```


## Creating the words list.
The list with the key words is essential in order to make the bot work, you need to create a _data.json_ file containing all the words (insults you want to block, command key words), you can incluide multiple languaje support.

* Example:
```json
{
    "data_en": {

        //Insults, curse words
        "ofensive_words": [
            "offensive word 1",
            "offensive word 2",
            "offensive word 3"
        ],

        //Words that trigger the /price command
        "price_words": [
            "price",
            "costs"
        ],

        //Words that trigger the /howToBuy command
        "buy_words": [
            "invest",
            "acquire"
        ]
    },

    "data_es": {

        //Insults, curse words
        "ofensive_words": [
            "insulto 1",
            "insulto 2",
            "insulto 3"
        ],

        //Words that trigger the /price command
        "price_words": [
            "precio",
            "costo"
        ],

        //Words that trigger the /howToBuy command
        "buy_words": [
            "invertir",
            "adquirir"
        ]
    },
}
```

After that, you need to go to the _woonk_bot.js file_ and make the following changes:
```JavaScript

 // Log every text message
bot.on('text', function (data) {

    let directory = 'data_en' //The default language
    let index = null

    if(data.chat.id == CHAT_ID) {
        i18n.setLocale('en_US');
        directory = 'data_en'
    }

    if(data.entities != undefined) {
        if(regexWoonkly(data.text)) {
            warnUser(data, __('spam'))
        }
    }

    //THIS PART OF THE CODE IS WHERE YOU MOVE AROUND THE JSON FILE YOU HAVE JUST CREATED.
    for (var i = 0; i < 3; i++) {   // 3 -> number of keys per language.
        if(checkContent(data, i, directory)) {
            index = i
            break
        }
    }
    switch (index) {  //the cases according to your JSON.
        case 0:
            warnUser(data, __('insult'))
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
})

```

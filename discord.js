const Discord = require('discord.js');
const client = new Discord.Client();

const virusTotal = require('node-virustotal');
const accessVirusTotal = virusTotal.makeAPI().setKey('YOUR_TOKEN');

const fetch = require('node-fetch');

const settings = require('./settings.json');

app.get('/', (request, response) => {

    response.sendStatus(200);

});

app.listen(process.env.PORT, () => {

    console.log('Listen Port: ' + listener.address().port);

});

client.on('ready', () => {

  console.log('VirusTotal Discord Bot Run Successfully.');

  client.user.setPresence({ game: { name: 'Files and Links', type: 'WATCHING' } });

});

client.on('message', (message) => {

    let messageReply = '';
    let promises = [];

    if(message.author.bot) {

        return;
        
    }

    if(message.attachments.size || message.embeds.length) {

        message.reply('Checking by VirusTotal Discord Bot please wait for your security.');

    }


    for (const attachment of message.attachments) {

        promises.push(new Promise((resolve, reject) => {

            fetch(attachment[1].url).then(res => res.buffer()).then(buffer => {
            
                accessVirusTotal.uploadFile(buffer, attachment[1].filename, (error, response) => {
            
                    messageReply += `\nFile: \`${attachment[1].filename}\``;

                    if (error) {

                        messageReply += `\nError: File could not be checked.`;

                        resolve(true);

                        return;

                    }
                    
                    let result = JSON.parse(response).data;

                    messageReply += `\nVirusTotal Link: https://www.virustotal.com/gui/file-analysis/${result.id}
                                    \n`;
                    
                    resolve(true);

                    return;

                });

            });

        }));
        
    }
    

    for (const embed of message.embeds) {

        if(embed.type === 'link' || embed.type === 'article') {

            promises.push(new Promise((resolve, reject) => {

                accessVirusTotal.initialScanURL(embed.url, (error, response) => {

                    messageReply += `\nUrl: \`${embed.url}\``;

                    if (error) {

                        messageReply += `\nError: Url could not be checked.`;

                        resolve(true);

                        return;

                    }
                    
                    let result = JSON.parse(response).data;

                    messageReply += `\nVirusTotal Link: https://www.virustotal.com/gui/url/${result.id.split('-')[1]}
                                    \n`;
                    
                    resolve(true);

                    return;

                });

            }));

        }
        
    }

    Promise.all(promises).then(() => {

        if(messageReply) {

            message.reply(messageReply);

        }

    });

});

client.login(settings.token);
var uuid = require('uuid');

const Discord = require("discord.js");
const randomColor = require('randomcolor'); // import the script
const sqlite3 = require('sqlite3').verbose();


//Mentör 692801945542459525
//Katılımcı 692801880249729054

/// The client itself. The Bot
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

// Here is a list of all the allowed roles for team members the have aside from their team role. 
// If there is already a role assigned to the user when allowed roles substracted, team register algorithm will throw an error
const allowedRolesForTeamMembers = [
  "Katılımcılar",
  "@everyone",
  "Muted",
  "Moderatör",
  "Ekip", // Remove this
  "Yönetici" // Remove this
];
var shallStop = false;

var db;

var userRecords= {};
var teamRecords=[];

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function setupDatabase(){
  var file = "hr";
    var db = new sqlite3.Database(file);
}

function brodcastMessageToTeam(memberList,message){
  memberList.forEach((memberr)=>{
    memberr.send(message);
  });
}

function registerTeam(guild,mentionsMemberList,teamName){


  var color = randomColor({
    luminosity: 'light',
    format: 'rgb' // e.g. 'rgb(225,200,20)'
  });
  


  guild.roles.create({
    data: {
      name: teamName,
      hoist: true,
      color: color.slice(4, 16).split(",").map((a) => {
        return parseInt(a.trim())
      }),
    },
  })
    .then((role) => {
      var roleContestant = guild.roles.cache.get("692801880249729054");
      mentionsMemberList.forEach((member) => {
        member.roles.add(role);
        member.roles.add(roleContestant);
      });

     guild.channels.create(teamName, {
        type: 'category',
      
      }).then((catagory)=>{
        guild.channels.create(teamName, {
          type: 'voice',
          parent: catagory,
          permissionOverwrites: [
            {
                id: role.id,
                allow: ['CONNECT'],
            },
            {
              id: guild.roles.everyone.id,
              deny: ['CONNECT']
            },
            {
              id: "692801945542459525", //Mentör
              allow: ['CONNECT'],
            }
          ],
        }).catch((error)=>{
          console.log(error);
           brodcastMessageToTeam(mentionsMemberList,"Bir hata oluştu. Moderatörlerle iletişime geç. Hata Kodu: RL204");
           return;
                  });
       guild.channels.create(teamName+ " Private Chat", {
          type: 'text',
          parent: catagory,
          permissionOverwrites: [
            {
              id: role.id,
              allow: ['VIEW_CHANNEL','SEND_MESSAGES','READ_MESSAGE_HISTORY'],
            },
            {
              id: "692801945542459525",
              allow: ['VIEW_CHANNEL','SEND_MESSAGES','READ_MESSAGE_HISTORY'],
            },
            {
              id: guild.roles.everyone.id,
              deny: ['VIEW_CHANNEL','SEND_MESSAGES','READ_MESSAGE_HISTORY']
            }
          ],
        }).catch((error)=>{
          console.log(error);
           brodcastMessageToTeam(mentionsMemberList,"Bir hata oluştu. Moderatörlerle iletişime geç. Hata Kodu: RL205");
           return;
          }).then((cat)=>{
            brodcastMessageToTeam(mentionsMemberList,"Takım "+teamName+ " başarıyla oluşturulmuştur");
          })
      }).catch((error)=>{
        console.log(error);
        brodcastMessageToTeam(mentionsMemberList,"Bir hata oluştu. Moderatörlerle iletişime geç. Hata Kodu: RL203");
        return;
      });
    })
    .catch((error) => {
      console.log(error);
      brodcastMessageToTeam(mentionsMemberList,"Bir hata oluştu. Moderatörlerle iletişime geç. Hata Kodu: RL202");
      return;
    });
}


client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});


client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.

  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if (message.author.bot) return;

  if(message.content.toLowerCase() == "evet"){
    var team = teamRecords.find(o => o.id === userRecords[message.author.id]);

      team.memberList[message.author.id] = true;

      for (const key in team.memberList) {
        if (team.memberList.hasOwnProperty(key)) {
          if(!team.memberList[key]) return;
        }
      }

      team.isCreated = true;
      var memberListTT = [];
      var guild  = client.guilds.cache.get("692459235413327903");
      for (const key in team.memberList) {
        var user = client.users.cache.get(key);
        var member = guild.member(user);
        memberListTT.push(member);
      }
      registerTeam(guild,memberListTT,team.name);
  }else if(message.content.toLowerCase() == "hayır"){
    var team = teamRecords.find(o => o.id === userRecords[message.author.id]);

    userRecords[message.author.id] = undefined;
    var memberListTT = [];
      var guild  = client.guilds.cache.get("692459235413327903");
      for (const key in team.memberList) {
        userRecords[key] = undefined;

        var user = client.users.cache.get(key);
        var member = guild.member(user);
        memberListTT.push(member);
      }
    brodcastMessageToTeam(memberListTT,message.author.tag + " takım davetini reddetti!");
  }
  

  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if (message.content.indexOf(config.prefix) !== 0) return;

  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).split(' ');
  const command = args.shift().toLowerCase();

  // Let's go with a few common example commands! Feel free to delete or change those.

  if (command === "kurallar") {
    message.channel.send("Kurallar:");
  }
  if(command === "forceKayıt"){
    const kayitArgs = message.content.slice(config.prefix.length + 5).split(',');
    if (kayitArgs.length != 2) {
      return message.reply("Üzgünüm, komut doğru formatta değil \n \n Format: \n !kayıt takım adı , @yarışmacı1 @yarışmacı2");
    }

    if (message.mentions.users.size < 1) {
      return message.reply("Hiç takım üyesi eklemedin!");
    }

    var teamName = capitalize(kayitArgs[0].toString().trim())

    var mentionsMemberList = [];


    await message.mentions.users.forEach(async (user) => {
      try {

        var member = message.guild.member(user);
        var memberRoleList = [];

        

        member.roles.cache.forEach((role) => {
          if (!allowedRolesForTeamMembers.includes(role.name)) {
            memberRoleList.push(memberRoleList);
          }
        });

        if (memberRoleList.length > 0) {
          shallStop = true
          return message.reply("Takım üyelerinden <@" + user.id.toString() + "> başka bir takıma kayıtlı. \n Kayıt sürecindeki bir sorun dahilinde moderatörlere yazabilirsiniz");
        } else if(userRecords[user.id] != undefined){
          return message.reply("Takım üyelerinden <@" + user.id.toString() + "> 'nın başka bir takım daveti var. Yeni bir takıma davet edilebilmesi için var olan daveti reddetmesi gerekiyor. Özel mesajlarına göz at!");
        }else {mentionsMemberList.push(member);
         
        }
      } catch (error) {
        console.log("error notced");
        console.log(error)
      }
    });

    registerTeam(message.guild,mentionsMemberList,teamName);

  }
  if (command === "kayıt") {
    shallStop = false;
    const kayitArgs = message.content.slice(config.prefix.length + 5).split(',');
    if (kayitArgs.length != 2) {
      return message.reply("Üzgünüm, komut doğru formatta değil \n \n Format: \n !kayıt takım adı , @yarışmacı1 @yarışmacı2");
    }

    if (message.mentions.users.size < 1) {
      return message.reply("Hiç takım üyesi eklemedin!");
    }

    var teamName = capitalize(kayitArgs[0].toString().trim())

    var mentionsMemberList = [];


    await message.mentions.users.forEach(async (user) => {
      try {

        var member = message.guild.member(user);
        var memberRoleList = [];

        

        member.roles.cache.forEach((role) => {
          if (!allowedRolesForTeamMembers.includes(role.name)) {
            memberRoleList.push(memberRoleList);
          }
        });

        if (memberRoleList.length > 0) {
          shallStop = true
          return message.reply("Takım üyelerinden <@" + user.id.toString() + "> başka bir takıma kayıtlı. \n Kayıt sürecindeki bir sorun dahilinde moderatörlere yazabilirsiniz");
        } else if(userRecords[user.id] != undefined){
          return message.reply("Takım üyelerinden <@" + user.id.toString() + "> 'nın başka bir takım daveti var. Yeni bir takıma davet edilebilmesi için var olan daveti reddetmesi gerekiyor. Özel mesajlarına göz at!");
        }else {mentionsMemberList.push(member);
         
        }
      } catch (error) {
        console.log("error notced");
        console.log(error)
      }
    });

    message.channel.send("<@"+message.author.id+">"+" Takım kayıt işlemi başlamıştır. Lütfen tüm takım üyeleri özel mesajlarını kontrol etsin! ");

    if (!shallStop) {
      const teamuid = uuid.v4();
      var team = new Team(teamName,teamuid);

      mentionsMemberList.forEach((member) => {
        if(member.id != message.author.id){
          team.memberList[member.id] = false;  
        }else team.memberList[member.id] = true;
        userRecords[member.id] = teamuid;
      });

      teamRecords.push(team);

      mentionsMemberList.forEach((member) => {
        if(member.id != message.author.id){
          member.send(message.author.tag.toString()+ "Seni "+teamName+" takımına davet etmek istiyor. Kabul etmek istiyorsan **"+"evet**. Reddetmek istiyorsan **hayır** diye cevap ver!");
        }
      });
      // Create a new role with data and a reason
     // registerTeam(message,mentionsMemberList,teamName);
    }


  }



});

client.login(config.token);


/* Text Channel Unvisible to others
  message.guild.channels.create("bremin", {
    type: 'text',
    permissionOverwrites: [
        {
          id: "694629011619446888",
          allow: ['VIEW_CHANNEL','SEND_MESSAGES','READ_MESSAGE_HISTORY'],
      },
      {
        id: "314731667501744128",
        deny: ['VIEW_CHANNEL','SEND_MESSAGES','READ_MESSAGE_HISTORY']
      }
    ],
  })
*/

/* This is a private catagory, which is unnecassary
  message.guild.channels.create("baban", {
    type: 'category',
    permissionOverwrites: [
        {
          id: "694629011619446888",
          allow: ['VIEW_CHANNEL'],
      },
      {
        id: "314731667501744128",
        deny: ['VIEW_CHANNEL']
      }
    ],
  })
*/

/*  Voice channel which is
  message.guild.channels.create(capitalize(kayitArgs[0].toString().trim()), {
    type: 'voice',
    permissionOverwrites: [
        {
          id: "694629011619446888",
          allow: ['CONNECT'],
      },
      {
        id: message.guild.roles.everyone.id,
        deny: ['CONNECT']
      }
    ],
  })
*/
  
  var Team = function (name,id) {
    this.memberList = {};
    this.name = name;
    this.id = id;
    this.isCreated = false;
  }

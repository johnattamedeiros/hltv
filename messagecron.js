const cron = require('node-cron');
const axios = require('axios');
const Sequelize = require('sequelize');
const Match = require('./models/Match'); 
const Message = require('./models/Message'); 
require('dotenv').config();

const POST_URL = process.env.MESSAGE_URL;

async function sendNewMatches() {
  try {
    const existingMessages = await Message.findAll({ attributes: ['code'] });
    const existingCodes = existingMessages.map(message => message.code);

    const newMatches = await Match.findAll({
      where: {
        code: { [Sequelize.Op.notIn]: existingCodes },
      },
    });

    console.log(`Encontradas ${newMatches.length} novas matches para enviar.`);

    
    for (const match of newMatches) {
      try {
        const messagewpp = ""+match.data.date+" "+match.data.team1+" "+match.data.score1+" x "+match.data.score2+" "+match.data.team2+"";
        const response = await axios.post(POST_URL, {
          message: messagewpp
        });
         if(response.status == 200 || response.status == '200'){
       
        console.log("Mensagem enviada, registrando envio");
            await Message.create({ code: match.code });
        }
       
      } catch (postError) {
        console.error(`Erro ao enviar dados: ${match.code}`, postError.message);
      }
    }
  } catch (error) {
    console.error('Erro na consulta ou no envio:', error.message);
  }
}

cron.schedule('*/10 * * * *', () => {
  console.log('Executando tarefa agendada...');
  sendNewMatches();
});

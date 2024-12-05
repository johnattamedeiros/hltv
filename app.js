const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const Match = require('./models/Match');
const sequelize = require('./db');
const messagecron = require('./messagecron')

require('dotenv').config();

async function scrapeMatches(url) {
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
  );

  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('table.match-table');

  const html = await page.content();
  const $ = cheerio.load(html);

  const matches = [];

  $('tr.team-row').each((index, element) => {
    const date = $(element).find('td.date-cell span').text().trim();
    const team1 = $(element).find('.team-1').text().trim();
    const team2 = $(element).find('.team-2').text().trim();
    const score1 = $(element).find('.score').first().text().trim();
    const score2 = $(element).find('.score').last().text().trim();

    const data = {
      date,
      team1,
      score1,
      team2,
      score2,
    };

    const code = `${date}_${team1}_${team2}`.replace(/\s+/g, '_');
    if(score1 !== '-'){
      matches.push({ code, data });
    }
  });

  await browser.close();
  return matches;
}

async function saveMatchesToDB() {
  try {
    await sequelize.sync();
    const matches = [];


    const matchesFuria = await scrapeMatches("https://www.hltv.org/team/8297/furia#tab-matchesBox");
    const matchesPain = await scrapeMatches("https://www.hltv.org/team/4773/pain#tab-matchesBox");
    const matchesMibr = await scrapeMatches("https://www.hltv.org/team/9215/mibr#tab-matchesBox");

    matches.push(...matchesFuria);
    matches.push(...matchesPain);
    matches.push(...matchesMibr);

    for (const match of matches) {
      const existingMatch = await Match.findOne({ where: { code: match.code } });

      if (!existingMatch) {
        await Match.create({
          code: match.code,
          data: match.data,
        });
        console.log(`Inserido: ${match.code}`);
      } else {
        console.log(`Já existe: ${match.code}`);
      }
    }
  } catch (error) {
    console.error("Erro ao salvar no banco:", error);
  }
}

// Executar a cada 15 minutos
setInterval(saveMatchesToDB, 15 * 60 * 1000);

// Executar a primeira vez imediatamente
saveMatchesToDB();

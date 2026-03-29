export default async function handler(req, res) {
  const { q } = req.query;

  
  const tokenRes = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" }
  );

  const tokenData = await tokenRes.json();
  const access_token = tokenData.access_token;

  
  const igdbRes = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": process.env.CLIENT_ID,
      "Authorization": `Bearer ${access_token}`,
    },
    body: `
      search "${q}";
      fields name, cover.image_id, involved_companies.company.name;
      limit 5;
    `
  });

  const data = await igdbRes.json();

  res.status(200).json(data);
}
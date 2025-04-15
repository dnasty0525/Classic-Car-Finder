// api/proxy.js

export default async function handler(req, res) {
  const xmlUrl = 'https://pjs.dealeraccelerate.com/third_party_access/public_site.xml?access_key=0bb8ab7731471002b99c';

  try {
    const response = await fetch(xmlUrl);
    const xmlText = await response.text();

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).send(xmlText);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch XML' });
  }
}

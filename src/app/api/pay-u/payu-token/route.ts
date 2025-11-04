import axios from 'axios';

export async function GET(req: Request) {
  const params = new URLSearchParams();
  console.log('Client ID:', process.env.PAYU_CLIENT_ID);
console.log('Client Secret:', process.env.PAYU_CLIENT_SECRET);

  params.append('grant_type', 'client_credentials');
  params.append('client_id', process.env.PAYU_CLIENT_ID!);
  params.append('client_secret', process.env.PAYU_CLIENT_SECRET!);
  params.append('scope', 'create_payment_links');

  try {
    const { data } = await axios.post(
      'https://payout.payumoney.com/oauth/token',
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return new Response(JSON.stringify({ access_token: data.access_token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    return new Response(JSON.stringify({ error: 'Failed to generate PayU token' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

import crypto from 'crypto';

export const verifyInitData = (_id: string, init_data: string): boolean => {
  const urlParams = new URLSearchParams(init_data);

  console.log('inviter_id: ', urlParams.get('start_param'));
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN environment variable is not defined');
  }

  const hash = urlParams.get('hash');
  if (!hash) {
    return false;
  }

  urlParams.delete('hash');
  urlParams.sort();

  let dataCheckString = '';
  for (const [key, value] of urlParams.entries()) {
    dataCheckString += `${key}=${value}\n`;
  }
  dataCheckString = dataCheckString.slice(0, -1);

  const secret = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex');

  const userJson = urlParams.get('user');
  console.log('userJson: ', userJson);
  if (!userJson) {
    return false;
  }
  const user = JSON.parse(userJson);
  const initDataTelegramId = user.id;
  return calculatedHash === hash && initDataTelegramId == _id;
};

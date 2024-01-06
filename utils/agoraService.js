// agoraService.js
const { RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole } = require('agora-token');

function generateAgoraInfo(channelName) {

  const appId = '0bffcb3b97ff4f58bf0d7ca8d92b6b5d';
  const appCertificate = '0e407391933141399e33d1c7e37013f0';
  const uid = '';
  const role = RtcRole.PUBLISHER;

  const expirationTimeInSeconds = 3600

  const currentTimestamp = Math.floor(Date.now() / 1000)

  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

  // IMPORTANT! Build token with either the uid or with the user account. Comment out the option you do not want to use below.

  // Build token with uid
  const token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs);

  // Set expiration time to 24 hours (86400 seconds)

  return token;
}

module.exports = { generateAgoraInfo };

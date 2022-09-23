const { EC2 } = require('aws-sdk');
const ec2 = new EC2({ apiVersion: '2016-11-15' });

const createImage = async (params = {}) => ec2.createImage(params).promise();

module.exports.execute = async (event) => {
  try {
    const { instanceId, version } = JSON.parse(event.body || '{}');
    const params = {
      NoReboot: true,
      InstanceId: instanceId,
      Name: `nmr-${version}`,
      Description: `An AMI for ${version}`,
      TagSpecifications: [
        {
          ResourceType: 'image',
          Tags: [
            { Key: 'CreatedBy', Value: 'Nur Rony' },
            { Key: 'Name', Value: `ueapp-${version}` },
            { Key: 'ueAppVersion', Value: `${version}` },
          ],
        },
        {
          ResourceType: 'snapshot',
          Tags: [
            { Key: 'CreatedBy', Value: 'Nur Rony' },
            { Key: 'Name', Value: `ueapp-${version}` },
            { Key: 'appVersion', Value: `${version}` },
          ],
        },
      ],
    };
    const imageResponse = await createImage(params);
    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageResponse }, null, 2),
      message: 'ami creation request is successful',
    };
  } catch (error) {
    console.error('error in createAmi lambda', error);
    return { statusCode: error.statusCode, body: JSON.stringify({ error }) };
  }
};

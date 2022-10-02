const { EC2 } = require('aws-sdk');

const region = process.env.AWS_REGION;

const ec2Service = new EC2({ region });

module.exports.execute = async event => {
  const {
    detail: { State = '', ImageId = '' },
  } = event;

  if (State.toLowerCase() !== 'available') {
    return console.error(`ami creation failed for ${ImageId}`);
  }

  const { Images = [] } = await ec2.describeImages({ ImageIds: [ImageId] }).promise();
  const { Tags = [] } = Images.pop();
  const { Value: instanceId } = Tags.find(({ Key }) => Key.toLowerCase() === 'sourceinstanceid');
  await ec2Service.terminateInstances({ InstanceIds: [instanceId] }).promise();
  console.log('terminated ami instance with id', instanceId);
};

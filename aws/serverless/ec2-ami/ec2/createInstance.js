const { EC2 } = require('aws-sdk');

const resources = JSON.parse(process.env.AWS_RESOURCES || '{}');
const currentAwsRegion = process.env.AWS_REGION;
const ec2 = new EC2({ apiVersion: '2016-11-15' });

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function createInstance(params, metadata = { Tags: [] }) {
  // const BlockDeviceMappings = [{ DeviceName: '/dev/xvda', Ebs: { VolumeSize: 50 } }];
  const { Tags = [], MetadataOptions = { InstanceMetadataTags: 'enabled', HttpEndpoint: 'enabled' } } = metadata;
  const TagSpecifications = [{ ResourceType: 'instance', Tags: [{ Key: 'Created', Value: 'Nur Rony' }, ...Tags] }];
  return ec2.runInstances({ ...params, MetadataOptions, TagSpecifications }).promise();
}

async function getInstanceDetails(params = {}) {
  return ec2.describeInstances(params).promise();
}

module.exports.execute = async (_) => {
  const currentRegionResources = resources[currentAwsRegion] || {};
  const {
    DefaultImageId: ImageId,
    InstanceType,
    KeyName,
    SecurityGroupIds,
    IamInstanceProfileArn,
    MinCount = 1,
    MaxCount = 1,
  } = currentRegionResources;

  const ec2Params = {
    ImageId,
    KeyName,
    MinCount,
    MaxCount,
    InstanceType,
    SecurityGroupIds,
    IamInstanceProfile: { Arn: IamInstanceProfileArn },
  };

  const { Instances = [] } = await createInstance(ec2Params, {
    Tags: [
      { Key: 'version', Value: 'v3' },
      { Key: 'Name', Value: 'ami-instance' },
    ],
  });
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Instances }, null, 2),
  };
};

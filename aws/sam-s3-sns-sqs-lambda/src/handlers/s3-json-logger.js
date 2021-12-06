const AWS = require("aws-sdk");

const s3 = new AWS.S3({ signatureVersion: "v4" });

const getSignedUrl = ({ Bucket, Key, Expires = process.env.EXPIRES || 300 }) =>
  s3.getSignedUrlPromise("getObject", { Bucket, Key, Expires });

exports.s3JsonLoggerHandler = async (event) => {
  //console.log("sqs event", event);
  const ctrFiles = getCtrRecordsFromSqsMessages(event.Records);
  const ctrS3Responses = await getCtrFileContent(ctrFiles);
  const ctrFilesContent = ctrS3Responses.map(({ Body }) =>
    JSON.parse(Body.toString("utf-8"))
  );
  console.log("ctrFileContent", ctrFilesContent);
  const requestBodies = await buildRequestBodies(ctrFilesContent);
};

async function buildRequestBodies(ctrFileContents) {
  return ctrFileContents.reduce(async (acc, ctrFile) => {
    const {
      ContactId,
      Agent: {
        AfterContactWorkStartTimestamp = "",
        AfterContactWorkEndTimestamp = "",
      } = {},
      Recording: { Location = "" } = {},
    } = ctrFile;
    const startTimestamp =
      new Date(AfterContactWorkStartTimestamp).getTime() / 1000;
    const endTimestamp =
      new Date(AfterContactWorkEndTimestamp).getTime() / 1000;
    const recordingBucketName = Location.spilt("/").shift();
    const recordingFilePrefix = Location.replace(`${recordingBucketName}/`, "");
    const audioRecordingSignedUrl = await getSignedUrl({
      Bucket: recordingBucketName,
      Key: recordingFilePrefix,
      Expires: process.env["URL_EXPIRE_SECONDS"] || 300,
    });
    return {
      ...(await acc),
      [ContactId]: {},
    };
  });
}

async function getCtrFileContent(ctrFiles = []) {
  return Promise.all(
    ctrFiles.map((ctrFile) =>
      s3.getObject({ Bucket: ctrFile.Bucket, Key: ctrFile.Key }).promise()
    )
  );
}
function getCtrRecordsFromSqsMessages(sqsMessages = []) {
  const ctrFiles = sqsMessages.reduce((result, sqsMessage) => {
    const s3CtrFiles = JSON.parse(sqsMessage.body);
    // console.log("s3CtrFiles", s3CtrFiles);
    const ctrFiles = s3CtrFiles.Records.map((s3CtrFile) => ({
      Bucket: s3CtrFile.s3.bucket.name,
      Key: s3CtrFile.s3.object.key,
    }));

    return [...result, ...ctrFiles];
  }, []);

  return ctrFiles;
}

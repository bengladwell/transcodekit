const util = require('util')
const { program } = require('commander')
// const CloudFormation = require('aws-sdk/clients/cloudformation')
const MediaConvert = require('aws-sdk/clients/mediaconvert')
const { version } = require('./package.json')

program
  .version(version)
  .requiredOption('-k, --access-key-id <id>', 'AWS access key id')
  .requiredOption('-s, --secret-access-key <key>', 'AWS secret access key')

program.parse(process.argv)

// const cloudFormation = new CloudFormation({
//   apiVersion: '2010-05-15',
//   region: 'us-east-1',
//   credentials: {
//     accessKeyId: program.accessKeyId,
//     secretAccessKey: program.secretAccessKey
//   }
// })

const mediaConvert = new MediaConvert({
  apiVersion: '2017-08-29',
  region: 'us-east-1',
  credentials: {
    accessKeyId: program.accessKeyId,
    secretAccessKey: program.secretAccessKey
  }
})

mediaConvert.describeEndpoints()
  .promise()
  .then(({ Endpoints: [{ Url: endpoint }]}, err) => {
    if (err) console.log(err, err.stack())
    console.log(endpoint)
    mediaConvert.endpoint = endpoint

    return mediaConvert.createJob({
      Role: 'arn:aws:iam::987989528587:role/DELETEME-Mediaconvert',
      JobTemplate: 'System-Ott_Hls_Ts_Avc_Aac',
      Settings: {
        Inputs: [{
          FileInput: 's3://transcodekit/originals/dodgeball.mov',
          AudioSelectors: {
            'Audio Selector 1': {
              Offset: 0
            }
          },
        }],
        OutputGroups: [{
          OutputGroupSettings: {
            Type: 'HLS_GROUP_SETTINGS',
            HlsGroupSettings: {
              Destination: 's3://transcodekit/assets/test_output/'
            }
          }
        }]
      },
      
    }).promise()
}).then((resp, error) => {
  if (error) console.log(error)

  console.log(util.inspect(resp, { depth: null, color: true }))
})

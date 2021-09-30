import * as AWS from 'aws-sdk'
import { createLogger } from '../utils/logger'

// const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('_ImageAPI')
const ATTACHMENT_S3_BUCKET = process.env.ATTACHMENT_S3_BUCKET
const SIGNED_URL_EXPIRATION = +process.env.SIGNED_URL_EXPIRATION
// TODO: Implement the dataLayer logic
class _AttachmentUtils {
  private s3: AWS.S3
  constructor() {
    this.s3 = new AWS.S3({ signatureVersion: 'v4' })
  }

  public async generateSignedURL(objectKey: string): Promise<string> {
    const result = await this.s3.getSignedUrl('putObject', {
      Bucket: ATTACHMENT_S3_BUCKET,
      Key: objectKey,
      Expires: SIGNED_URL_EXPIRATION
    })

    logger.info('Successfully generated signedURl', { objectKey })

    return result
  }
}

// singleton pattern
export const AttachmentUtils = new _AttachmentUtils()

import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import uuid from 'uuid'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')
const TODOS_TABLE = process.env.TODOS_TABLE
const bucketName = process.env.ATTACHMENT_S3_BUCKET;

// TODO: Implement the dataLayer logic
class _TodosAccess {
  private docClient: DocumentClient

  constructor() {
    this.docClient = new DocumentClient()
    console.log(XAWS)
  }

  public async retrieveUserTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: TODOS_TABLE,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    logger.info('Successfully retrieved todo Items', result.Items)
    let todos = result.Items;
    todos = todos.map(todo=> ({
      ...todo,
      attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todo.todoId}`
    }))

    return todos as TodoItem[]
  }

  public async saveNewTodo(
    userId: string,
    name: string,
    dueDate: string
  ): Promise<TodoItem> {
    const todoId = uuid.v4()
    const newTodo = {
      userId: userId,
      name: name,
      dueDate: dueDate,
      done: false,
      todoId: todoId,
      createdAt: new Date().toISOString()
    }
    const result: any = await this.docClient
      .put({
        TableName: TODOS_TABLE,
        Item: newTodo
      })
      .promise()

    logger.info('New  todo created', result)

    return newTodo
  }

  async getTodo(userId: string, todoId: string) {
    logger.info('Retrieving a todo, data=' + JSON.stringify({ userId, todoId }))
    const existingTodo = await this.docClient
      .get({
        TableName: TODOS_TABLE,
        Key: {
          todoId,
          userId
        }
      })
      .promise()

    return existingTodo.Item
  }
  async updateTodo(todoId: string, userId: string, todo: TodoUpdate) {
    const result = await this.docClient
      .update({
        TableName: TODOS_TABLE,
        Key: {
          todoId,
          userId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done= :done',
        ExpressionAttributeValues: {
          ':name': todo.name,
          ':dueDate': todo.dueDate,
          ':done': todo.done
        },
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ReturnValues: 'ALL_NEW'
      })
      .promise()
    logger.info('Updated todo', result)
    return result.Attributes as TodoItem
  }

  async delete(userId, todoId) {
    const result = await this.docClient
      .delete({
        TableName: TODOS_TABLE,
        Key: {
          userId,
          todoId
        }
      })
      .promise()
    logger.info('Deleted Item successfully', result)
    console.log('Deleted Item successfully', result)
    return result
  }
}

// singleton pattern
export const TodosAccess = new _TodosAccess()

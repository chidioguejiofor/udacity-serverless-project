import { TodosAccess } from '../helpers/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as createError from 'http-errors'

const logger = createLogger('BussinessTodo')
type BusinessLogicReturnType = Promise<
  [
    number, //status-code
    string //json
  ]
>

const assertTodoExists = async (
  userId: string,
  todoId: string
): Promise<void> => {
  const existingTodo = await TodosAccess.getTodo(userId, todoId)

  if (!existingTodo) {
    throw new createError.NotFound('The todoId you specified does not exists')
  }
}
export const getTodosForUser = async (
  userId: string
): BusinessLogicReturnType => {
  let todos = await TodosAccess.retrieveUserTodos(userId)

  return [200, JSON.stringify({ items: todos })]
}

export const createTodo = async (
  userId: string,
  newTodoItem: CreateTodoRequest
): BusinessLogicReturnType => {
  const { dueDate, name } = newTodoItem
  logger.info('Trying to create todo', {
    newTodoItem,
    userId
  })
  const savedItem = await TodosAccess.saveNewTodo(userId, name, dueDate)

  return [201, JSON.stringify({ item: savedItem })]
}

export const updateTodo = async (
  userId: string,
  todoId: string,
  todo: UpdateTodoRequest
): BusinessLogicReturnType => {
  await assertTodoExists(userId, todoId)

  logger.info('Updating todo with Id=' + todoId)
  const updatedItem = await TodosAccess.updateTodo(todoId, userId, todo)
  return [200, JSON.stringify(updatedItem)]
}

export const deleteTodo = async (
  userId: string,
  todoId: string
): BusinessLogicReturnType => {
  await assertTodoExists(userId, todoId)
  logger.info('Deleting todo Item')
  const result = await TodosAccess.delete(userId, todoId)
  logger.info('Deleted called successfully', result)
  return [200, JSON.stringify({ message: 'Deleted todo successfully' })]
}

export const createAttachmentPresignedUrl = async (
  userId: string,
  todoId: string
): BusinessLogicReturnType => {
  await assertTodoExists(userId, todoId)
  const signedURL = await AttachmentUtils.generateSignedURL(todoId)
  return [
    201,
    JSON.stringify({
      uploadUrl: signedURL
    })
  ]
}

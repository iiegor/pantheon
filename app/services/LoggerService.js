import chalk from 'chalk'

export default class LoggerService {
	log(str) {
    console.log(chalk.cyan.bold(`[Info] ${str}`))
	}

  debug(str) {
    console.log(chalk.grey.bold(`[Debug] ${str}`))
  }
}
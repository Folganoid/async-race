import { IConfig } from '../interfaces/Models';
import HtmlBuilder from '../view/HtmlBuilder';

export default class ErrorHandler {
  private htmlBuilder: HtmlBuilder;

  private APP_CONFIG: IConfig;

  public constructor(json: IConfig) {
    this.htmlBuilder = new HtmlBuilder();
    this.APP_CONFIG = json;
  }

  public main<Type>(err: Type): void {
    if (err instanceof Error) {
      if (err.message.substring(0, 3) === '504') {
        this.htmlBuilder.addMessage(`Check connection to server ${this.APP_CONFIG.server.path}`, 'error');
      }
      this.addMessage(err.message, 'error');
    } else if (typeof err === 'string') {
      this.addMessage(err, 'error');
    }
  }

  public addMessage(text: string, type: 'warning' | 'info' | 'error') {
    this.htmlBuilder.addMessage(text, type);
  }
}

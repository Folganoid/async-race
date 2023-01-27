import HtmlBuilder from '../view/HtmlBuilder';
import HTTPservice from '../services/HTTPservice';
import ErrorHandler from './ErrorHandler';
import CarHandler from './CarHandler';
import WinnersHandler from './WinnersHandler';
import { ICar, IConfig } from '../interfaces/Models';

export default class SPAHandler {
  private errorHandler: ErrorHandler;

  private httpService: HTTPservice;

  private carHandler: CarHandler;

  private winnersHandler: WinnersHandler;

  private htmlBuilder = new HtmlBuilder();

  private APP_CONFIG: IConfig;

  public constructor(json: IConfig) {
    this.APP_CONFIG = json;
    this.httpService = new HTTPservice(this.APP_CONFIG);
    this.winnersHandler = new WinnersHandler(this.APP_CONFIG);
    this.carHandler = new CarHandler(this.APP_CONFIG);
    this.errorHandler = new ErrorHandler(this.APP_CONFIG);
  }

  public init(): void {
    try {
      this.htmlBuilder.init();
      this.carHandler.init();

      this.startSpa();

      this.winnersHandler.init();

      const cars = this.httpService.getAll();
      cars
        .then((d) => {
          const data = d as ICar[] | string;
          if (typeof data === 'object') {
            this.htmlBuilder.buildCarList(data);
          } else {
            this.errorHandler.addMessage(`ERROR: ${data}`, 'error');
          }
        })
        .then(() => {
          this.carHandler.garageHandler.init();
        })
        .catch((e: Error) => {
          this.errorHandler.main(e);
        });
    } catch (e) {
      this.errorHandler.main(e);
    }
  }

  private startSpa(): void | never {
    const garage: HTMLElement | null = document.getElementById('garage');
    const winners: HTMLElement | null = document.getElementById('winners');
    if (!garage || !winners) throw new Error('Something wrong with #winners or #garage');

    const garageBtn: HTMLElement | null = document.getElementById('garage-btn');
    const winnersBtn: HTMLElement | null = document.getElementById('winners-btn');
    if (!garageBtn || !winnersBtn) throw new Error('Something wrong with #winners-btn or #garage-btn');

    garageBtn.addEventListener('click', () => {
      winners.classList.add('hidden');
      winnersBtn.classList.remove('active');
      garage.classList.remove('hidden');
      garageBtn.classList.add('active');
    });

    winnersBtn.addEventListener('click', () => {
      winners.classList.remove('hidden');
      winnersBtn.classList.add('active');
      garageBtn.classList.remove('active');
      garage.classList.add('hidden');
    });
  }
}

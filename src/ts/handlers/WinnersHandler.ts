import { ICar, IConfig, IWinner } from '../interfaces/Models';
import HTTPservice from '../services/HTTPservice';
import HtmlBuilder from '../view/HtmlBuilder';
import ErrorHandler from './ErrorHandler';

export default class WinnersHandler {
  private pageCur = 1;

  private pageTotal = 1;

  private carsPage: number;

  private sortColumn = 'num';

  private sortDirect = 'ASC';

  private errorHandler: ErrorHandler;

  private httpService: HTTPservice;

  private htmlBuilder = new HtmlBuilder();

  private APP_CONFIG: IConfig;

  constructor(json: IConfig) {
    this.APP_CONFIG = json;
    this.httpService = new HTTPservice(this.APP_CONFIG);
    this.errorHandler = new ErrorHandler(this.APP_CONFIG);
    this.carsPage = this.APP_CONFIG.pageParams.winnersCarsPage;
  }

  public init(): void {
    this.fillList();
    this.pagesController();
    this.sortController();
  }

  private pagesController(): void | never {
    const prevBtn = <HTMLButtonElement | null>document.getElementById('winners-page-prev-btn');
    const nextBtn = <HTMLButtonElement | null>document.getElementById('winners-page-next-btn');
    if (!prevBtn || !nextBtn) throw new Error('Something wrong with #winners-page-prev-btn or #winners-page-next-btn');

    prevBtn.addEventListener('click', () => {
      this.setTotal();
      if (this.pageCur > 1) {
        this.pageCur -= 1;
        this.clearCarsFromPage();
      }
      this.setCur();
    });

    nextBtn.addEventListener('click', () => {
      this.setTotal();
      if (this.pageCur < this.pageTotal) {
        this.pageCur += 1;
        this.clearCarsFromPage();
      }
      this.setCur();
    });
  }

  private sortController(): void | never {
    const sortIdBtn = <HTMLButtonElement | null>document.getElementById('sort-num');
    const sortWinBtn = <HTMLButtonElement | null>document.getElementById('sort-win');
    const sortTimeBtn = <HTMLButtonElement | null>document.getElementById('sort-time');

    if (!sortIdBtn || !sortWinBtn || !sortTimeBtn) {
      throw new Error('Something wrong with sort buttons');
    }

    sortIdBtn.addEventListener('click', () => {
      if (this.sortColumn !== 'id') { this.sortColumn = 'id'; this.sortDirect = 'ASC'; } else {
        this.sortDirect = (this.sortDirect === 'ASC') ? 'DESC' : 'ASC';
      }
      this.fillList();
    });
    sortWinBtn.addEventListener('click', () => {
      if (this.sortColumn !== 'wins') { this.sortColumn = 'wins'; this.sortDirect = 'ASC'; } else {
        this.sortDirect = (this.sortDirect === 'ASC') ? 'DESC' : 'ASC';
      }
      this.fillList();
    });
    sortTimeBtn.addEventListener('click', () => {
      if (this.sortColumn !== 'time') { this.sortColumn = 'time'; this.sortDirect = 'ASC'; } else {
        this.sortDirect = (this.sortDirect === 'ASC') ? 'DESC' : 'ASC';
      }
      this.fillList();
    });
  }

  public clearCarsFromPage(): void | never {
    const list = document.querySelectorAll('#winner-list tr');
    if (!list) throw new Error('Something wrong with #winner-list tr');
    for (let i = 0; i < list.length; i += 1) {
      const el = list[i] as HTMLElement;
      if (i < this.pageCur * this.carsPage && i >= this.pageCur * this.carsPage - this.carsPage) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  }

  public fillList(): void {
    const winners = this.httpService.getAllWinners(this.sortColumn, this.sortDirect);
    winners
      .then((dW) => {
        const dataWinners = dW as IWinner[] | string;
        if (typeof dataWinners === 'object') {
          this.httpService.getAll()
            .then((dC) => {
              const dataCars = dC as ICar[] | string;
              if (typeof dataCars === 'object') {
                this.htmlBuilder.buildWinnerList(dataWinners, dataCars);
              } else {
                this.errorHandler.addMessage(`ERROR: ${dataWinners}`, 'error');
              }
            })
            .then(() => {
              this.setTotal();
              this.clearCarsFromPage();
              this.setCur();
            })
            .catch((e: Error) => {
              this.errorHandler.main(e);
            });
        } else {
          this.errorHandler.addMessage(`ERROR: ${dataWinners}`, 'error');
        }
      })
      .catch((e: Error) => {
        this.errorHandler.main(e);
      });
  }

  public setTotal(): void | never {
    const list = document.querySelectorAll('#winner-list > tr');
    if (!list) throw new Error('Something wrong with #winners-list tr');
    const totalTxt = document.getElementById('winners-page-total');
    if (!totalTxt) throw new Error('Something wrong with #winners-page-total');
    const total = document.getElementById('winners-total');
    if (!total) throw new Error('Something wrong with #winners-total');
    this.pageTotal = Math.ceil(list.length / this.carsPage) > 0
      ? Math.ceil(list.length / this.carsPage) : 1;

    if (this.pageCur > this.pageTotal) this.pageCur = this.pageTotal;

    totalTxt.innerHTML = String(this.pageTotal);
    total.innerHTML = String(list.length);
  }

  public setCur(): void | never {
    const curTxt = document.getElementById('winners-page-cur');
    if (!curTxt) throw new Error('Something wrong with #winners-page-cur');
    curTxt.innerHTML = String(this.pageCur);
  }
}

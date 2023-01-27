import { IConfig } from '../interfaces/Models';

export default class GarageHandler {
  private pageCur = 1;

  private pageTotal = 1;

  private carsPage = 7;

  private APP_CONFIG: IConfig;

  constructor(json: IConfig) {
    this.APP_CONFIG = json;
    this.carsPage = this.APP_CONFIG.pageParams.garageCarsPage;
  }

  public init(): void {
    this.pagesController();
    this.clearCarsFromPage();
    this.setTotal();
  }

  private pagesController(): void | never {
    const prevBtn = <HTMLButtonElement | null>document.getElementById('garage-page-prev-btn');
    const nextBtn = <HTMLButtonElement | null>document.getElementById('garage-page-next-btn');
    if (!prevBtn || !nextBtn) throw new Error('Something wrong with #garage-page-prev-btn or #garage-page-next-btn');

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

  public clearCarsFromPage(): void {
    const garageList = document.querySelectorAll('#garage-list .garage__car-block');
    if (!garageList) throw new Error('Something wrong with #garage-page-prev-btn or #garage-list');
    for (let i = 0; i < garageList.length; i += 1) {
      const el = garageList[i] as HTMLElement;
      if (i < this.pageCur * this.carsPage && i >= this.pageCur * this.carsPage - this.carsPage) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  }

  public setTotal(): void | never {
    const garageList = document.querySelectorAll('#garage-list .garage__car-block');
    if (!garageList) throw new Error('Something wrong with #garage-page-prev-btn or #garage-list');
    const totalTxt = document.getElementById('garage-page-total');
    if (!totalTxt) throw new Error('Something wrong with #garage-page-total');
    const garageTotal = document.getElementById('garage-total');
    if (!garageTotal) throw new Error('Something wrong with #garage-total');

    this.pageTotal = Math.ceil(garageList.length / this.carsPage) > 0
      ? Math.ceil(garageList.length / this.carsPage) : 1;

    if (this.pageCur > this.pageTotal) this.pageCur = this.pageTotal;

    totalTxt.innerHTML = String(this.pageTotal);
    garageTotal.innerHTML = String(garageList.length);
  }

  public setCur(): void {
    const curTxt = document.getElementById('garage-page-cur');
    if (!curTxt) throw new Error('Something wrong with #garage-page-cur');

    curTxt.innerHTML = String(this.pageCur);
  }
}

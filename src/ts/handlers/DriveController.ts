import { IWinner, IConfig } from '../interfaces/Models';
import HTTPservice from '../services/HTTPservice';
import HtmlBuilder from '../view/HtmlBuilder';
import ErrorHandler from './ErrorHandler';
import WinnersHandler from './WinnersHandler';

type Cb = (a: number) => void;

interface IAnimationIds {
    [index: number]: number;
  }

export default class DriveController {
  private animationIds: IAnimationIds = {};

  private htmlBuilder = new HtmlBuilder();

  private httpService: HTTPservice;

  private errorHandler: ErrorHandler;

  private winnersHandler: WinnersHandler;

  private timerOn = false;

  private raceMode = 'solo';

  private timerWinResult = '';

  private timerSecResult = '';

  private timerThrResult = '';

  private finish: number[] = [];

  private inRace: number[] = [];

  private APP_CONFIG: IConfig;

  public constructor(json: IConfig) {
    this.APP_CONFIG = json;
    this.httpService = new HTTPservice(this.APP_CONFIG);
    this.winnersHandler = new WinnersHandler(this.APP_CONFIG);
    this.errorHandler = new ErrorHandler(this.APP_CONFIG);
  }

  public startEngine(id: number): void {
    if (!this.timerOn) {
      this.finish = [];
      this.timerOn = true;
      this.htmlBuilder.timerStart();
    }
    if (!this.inRace.includes(id)) this.inRace.push(id);
  }

  public setMode(act: 'race' | 'solo') {
    this.raceMode = act;
  }

  public driveCar(id: number, velocity: number, distance: number): void | never {
    this.startAnimation(id, velocity * 200, (progress) => {
      const car = <HTMLElement | null>document.querySelector(`.garage__car-block[data-id="${id}"] .garage__car-container`);
      if (!car) throw new Error('Something wrong with .garage__create-control elements');

      const translate = this.easeInOut(progress) * (distance / 5000);
      car.style.left = `calc(${translate}% - ${translate}px)`;
      if (translate > 99.9 && !this.finish.includes(id) && !this.finish.includes(-id)) {
        this.htmlBuilder.carSmokeBack(id, 'stop');
        this.finish.push(id);
        if (this.inRace.includes(id)) { this.inRace = this.inRace.filter((el) => el !== id); }
        this.htmlBuilder.changeFlag(id, 'anim');
        if (this.inRace.length === 0 && this.finish.length === 0) {
          this.htmlBuilder.disableRaceControlBtn();
          this.htmlBuilder.timerReset();
          this.timerWinResult = ''; this.timerSecResult = ''; this.timerThrResult = '';
        }
        if (this.inRace.length === 0) { this.timerOn = false; this.htmlBuilder.timerStop(); }
        if (this.timerWinResult === '') {
          this.timerWinResult = this.htmlBuilder.timerResult;
          this.htmlBuilder.carPhrase(id, `${(this.raceMode === 'solo') ? `My result ${this.htmlBuilder.timerResult} sec` : 'I WON !!!'}`, 2000);
          const carNameEl = document.querySelector(`.garage__car-name[data-id="${id}"]`);
          const carName = (carNameEl) ? carNameEl.innerHTML : 'Ghost rider';
          if (this.raceMode === 'race') {
            this.htmlBuilder.middleMsg(`${carName} (${id}) WON in ${this.timerWinResult} sec.`, 3);
            this.httpService.addWinner(id, +this.timerWinResult)
              .then((resp) => {
                const winResp = resp as IWinner;
                if (winResp.id) {
                  this.errorHandler.addMessage(`${carName} (${id}) added to winList`, 'info');
                  this.winnersHandler.fillList();
                } else { this.errorHandler.addMessage(`Win can not add to winners list: ${winResp}`, 'error'); }
              }).catch((err) => { throw new Error(`${err.message}`); });
          }
        } else if (this.timerWinResult !== '' && this.timerSecResult === '') {
          this.timerSecResult = this.htmlBuilder.timerResult;
          this.htmlBuilder.carPhrase(id, `${(this.raceMode === 'solo') ? `My result ${this.htmlBuilder.timerResult} sec` : 'I am SECOND.'}`, 2000);
        } else if (this.timerSecResult !== '' && this.timerThrResult === '') {
          this.timerThrResult = this.htmlBuilder.timerResult;
          this.htmlBuilder.carPhrase(id, `${(this.raceMode === 'solo') ? `My result ${this.htmlBuilder.timerResult} sec` : 'I am THIRD.'}`, 2000);
        } else { this.htmlBuilder.carPhrase(id, `${(this.raceMode === 'solo') ? `My result ${this.htmlBuilder.timerResult} sec` : `${this.htmlBuilder.timerResult} - Not bad`}`, 2000); }
      }
    });
  }

  public stopCar(id: number): void | never {
    window.cancelAnimationFrame(this.animationIds[id]);
    const car = <HTMLElement | null>document.querySelector(`.garage__car-block[data-id="${id}"] .garage__car-container`);
    if (!car) throw new Error('Something wrong with .garage__create-control elements');
    car.style.left = 'calc(0% - 0px)';
    this.htmlBuilder.carSmokeBack(id, 'stop');
    this.htmlBuilder.carSmokeAbove(id, 'stop');
    this.htmlBuilder.disableCarControlBtn(id);
    this.htmlBuilder.disableCarControlBtn(id, ['stop']);
    this.htmlBuilder.carPhrase(id, '', 0);
    this.htmlBuilder.changeFlag(id, 'stat');
    if (this.inRace.includes(id)) {
      this.inRace = this.inRace.filter((el) => el !== id);
    }
    if (this.finish.includes(id) || this.finish.includes(-id)) {
      this.finish = this.finish.filter((el) => el !== id && el !== -id);
    }

    if (this.inRace.length === 0) {
      this.timerOn = false;
      this.htmlBuilder.timerStop();
    }

    if (this.inRace.length === 0 && this.finish.length === 0) {
      this.htmlBuilder.disableRaceControlBtn();
      this.htmlBuilder.timerReset();
      this.timerWinResult = '';
      this.timerSecResult = '';
      this.timerThrResult = '';
    }
  }

  public brokenCar(id: number): void {
    this.htmlBuilder.boomAbove(id);
    this.htmlBuilder.carPhrase(
      id,
      this.httpService.getRandom(this.APP_CONFIG.phrases.crash),
      3000,
    );
    setTimeout(() => {
      this.htmlBuilder.carSmokeAbove(id, 'start');
    }, 2000);
    setTimeout(() => {
      this.htmlBuilder.carPhrase(
        id,
        this.httpService.getRandom(this.APP_CONFIG.phrases.brokenCar),
        5000,
      );
    }, 4000);
    this.htmlBuilder.carSmokeBack(id, 'stop');
    window.cancelAnimationFrame(this.animationIds[id]);
    if (this.inRace.includes(id)) {
      this.inRace = this.inRace.filter((el) => el !== id);
    }

    if (this.inRace.length === 0) {
      this.timerOn = false;
      this.htmlBuilder.timerStop();
    }

    if (!this.finish.includes(id) && !this.finish.includes(-id)) {
      this.finish.push(-id);
    }
  }

  public goodCar(id: number): void {
    const phrase = this.APP_CONFIG.phrases.goodCar[
      Math.floor((Math.random() * this.APP_CONFIG.phrases.goodCar.length))
    ];
    this.htmlBuilder.carPhrase(id, phrase, 3000);
  }

  private startAnimation(carId: number, velocity: number, cb: Cb): void {
    let startAnimation: number;
    let requestId: number;

    const that = this;
    requestId = window.requestAnimationFrame(function measure(time) {
      that.animationIds[carId] = requestId;
      if (!startAnimation) {
        startAnimation = time;
      }

      const progress: number = (time - startAnimation) / velocity;
      cb(progress);
      if (progress < 1) {
        requestId = window.requestAnimationFrame(measure);
        that.animationIds[carId] = requestId;
      }
    });
  }

  private easeInOut(time: number): number {
    return 0.5 * (1 - Math.cos(Math.PI * time));
  }
}

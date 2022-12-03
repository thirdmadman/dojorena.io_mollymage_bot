import Board from './bot/Client/Board';
import fs from 'fs';
import { COMMANDS_MOVEMENT } from './bot/Client/Commands';
import { LogicResolver } from './bot/Client/GameAPI';

export default class MyLogicResolver implements LogicResolver {

  private lastBoardString = '';
  
  private getRandomInt = (min: number, max: number) => {
    const newMin = Math.ceil(min);
    const newMax = Math.floor(max);
    return Math.floor(Math.random() * (newMax - newMin + 1)) + newMin;
  };


  resolve(messageFromServer: string) {
    const board = new Board(messageFromServer);
    // if (board.isHeroDead()) {
    //   const fileName = `${new Date().toISOString().split('.')[0].replaceAll(':', '-')}.txt`;
    //   fs.writeFile(fileName, this.lastBoardString, (err) => {
    //     if (err) throw err;
    //   });
    // }

    this.lastBoardString = messageFromServer;


    const mySafeAvailableMoves = board.getMySafeAvailableMoves() as Array<COMMANDS_MOVEMENT>;
    console.log('mySafeAvailable ', mySafeAvailableMoves);

    const magneticDirections = board.getMagneticDirections();
    console.log('magneticDirections ', magneticDirections);

    const getIntersection = (array1: Array<COMMANDS_MOVEMENT>, array2: Array<COMMANDS_MOVEMENT>) =>
      array1.filter((value) => array2.includes(value));

    let magneticIntersection = new Array<COMMANDS_MOVEMENT>();

    if (magneticDirections && magneticDirections.length > 0 && mySafeAvailableMoves) {
      magneticIntersection = getIntersection(mySafeAvailableMoves, magneticDirections);
    }

    let randomCommand = '';

    if (magneticIntersection && magneticIntersection.length > 0) {
      randomCommand =
        COMMANDS_MOVEMENT[magneticIntersection[Math.floor(Math.random() * magneticIntersection.length)] as unknown as COMMANDS_MOVEMENT];
    } else {
      randomCommand =
        COMMANDS_MOVEMENT[mySafeAvailableMoves[Math.floor(Math.random() * mySafeAvailableMoves.length)] as unknown as COMMANDS_MOVEMENT];
    }

    const command = `${randomCommand}, ACT`;


    return command;
  }

  public readFromFile() {
    fs.readFile('2022-12-02T09-14-52.txt', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      const board = new Board(data);
      console.log(board.getBoardText());
      const mySafeAvailableMoves = board.getMySafeAvailableMoves();
      console.log('mySafeAvailable ', mySafeAvailableMoves);
      // console.log(board);
    });

    return 'ff';
  }
}
